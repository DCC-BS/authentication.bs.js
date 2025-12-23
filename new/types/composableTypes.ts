import type { AuthData } from './authData';
import type { Ref } from 'vue';

export type SingOut = () => Promise<void>;

export type useAuth = () => {
  singOut: SingOut;
  data: Ref<AuthData | null>;
}
