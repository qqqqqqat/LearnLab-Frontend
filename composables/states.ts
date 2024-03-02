

export const useUserState = () => useState<User | undefined | null>('user-state', () => null)
export const useAvatarState = () => useState<Avatar | undefined | null>('avatar-state', () => null)