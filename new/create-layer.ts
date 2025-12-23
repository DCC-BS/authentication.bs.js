#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdirSync, symlinkSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    try {
        const layerName = await question('Enter the name for your Nuxt layer: ');

        if (!layerName || layerName.trim() === '') {
            console.error('❌ Layer name cannot be empty');
            rl.close();
            process.exit(1);
        }

        const trimmedLayerName = layerName.trim();
        const relativeLayerPath = `layers/${layerName.trim()}`;

        console.log(`\n🚀 Creating Nuxt layer: ${trimmedLayerName}...`);

        // Create the Nuxt layer
        execSync(`npm create nuxt@latest -- --template layer ${relativeLayerPath}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ Nuxt layer created successfully!');

        // Symlink the types folder
        const layerPath = join(process.cwd(), relativeLayerPath);
        const typesSource = join(process.cwd(), 'types');
        const typesTarget = join(layerPath, 'types');

        if (existsSync(typesSource)) {
            console.log('\n🔗 Creating symlink for types folder...');

            if (existsSync(typesTarget)) {
                console.log('⚠️  types folder already exists in the layer, skipping symlink');
            } else {
                symlinkSync(typesSource, typesTarget, 'dir');
                console.log('✅ Types folder symlinked successfully!');
            }
        } else {
            console.log('\n⚠️  No types folder found in the current directory to symlink');
        }

        console.log(`\n🎉 Done! Your layer "${trimmedLayerName}" is ready to use.`);

    } catch (error) {
        console.error('\n❌ Error creating layer:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
