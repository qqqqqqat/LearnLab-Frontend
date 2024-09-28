export const useUserState = () =>
    useState<User | undefined | null>('user-state', () => null)
export const useUserCourseState = () =>
    useState<UserRoles | undefined | null>('user-course-state', () => null)
export const useAvatarState = () =>
    useState<Avatar | undefined | null>('avatar-state', () => null)
