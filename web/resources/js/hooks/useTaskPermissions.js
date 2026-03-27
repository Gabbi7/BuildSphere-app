import { CREATOR_ROLES } from '../utils/taskConstants';

/**
 * Given the authenticated user, return capability flags for the task UI.
 */
export default function useTaskPermissions(user) {
    const role = user?.role?.toLowerCase().replace(/ /g, '_') ?? '';
    const isCreator = CREATOR_ROLES.includes(role);

    return {
        // Only creator roles (executive, engineering, sales, etc.) can add tasks.
        // Foreman and Staff will receive false here and cannot see Add Task button.
        canCreateTask:       isCreator,
        canUpdateTask:       isCreator,
        canUpdateStatus:     isCreator,
        canUploadAttachment: isCreator,
        canComment:          !!user, // all authenticated users
        canDeleteTask:       isCreator,
    };
}
