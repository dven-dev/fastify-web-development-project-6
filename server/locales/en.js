// @ts-check

export default {
  translation: {
    appName: 'Task Manager',
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
        update: {
          error: 'Failed to update',
          success: 'User updated successfully',
        },
        delete: {
          success: 'User deleted successfully',
          error: 'Cannot delete user because it is associated with a task',
        },
      },
      statuses: {
        create: {
          error: 'Failed to create status',
          success: 'Status created successfully',
        },
        update: {
          error: 'Failed to update status',
          success: 'Status updated successfully',
        },
        delete: {
          success: 'Status deleted successfully',
          error: 'Cannot delete status because it is associated with a task',
        },
      },
      tasks: {
        create: {
          error: 'Failed to create task',
          success: 'Task created successfully',
        },
        update: {
          error: 'Failed to update task',
          success: 'Task updated successfully',
        },
        delete: {
          success: 'Task deleted successfully',
          error: 'Only the creator can delete a task',
        },
      },
      labels: {
        create: {
          error: 'Failed to create label',
          success: 'Label created successfully',
        },
        update: {
          error: 'Failed to update label',
          success: 'Label updated successfully',
        },
        delete: {
          success: 'Label deleted successfully',
          error: 'Cannot delete label because it is associated with a task',
        },
      },
      authError: 'Access denied! Please login',
      accessDenied: 'You cannot edit or delete another user',
    },
    layouts: {
      application: {
        users: 'Users',
        statuses: 'Statuses',
        tasks: 'Tasks',
        labels: 'Labels',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        id: 'ID',
        fullName: 'Full name',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        password: 'Password',
        createdAt: 'Created at',
        actions: 'Actions',
        delete: 'Delete',
        index: {
          title: 'Users',
        },
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
        edit: {
          submit: 'Edit',
          title: 'Edit user',
          link: 'Edit',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Name',
        createdAt: 'Created at',
        actions: 'Actions',
        delete: 'Delete',
        index: {
          title: 'Statuses',
        },
        new: {
          title: 'Create status',
          submit: 'Create',
        },
        edit: {
          title: 'Edit status',
          submit: 'Edit',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Name',
        description: 'Description',
        status: 'Status',
        creator: 'Creator',
        executor: 'Executor',
        labels: 'Labels',
        createdAt: 'Created at',
        actions: 'Actions',
        delete: 'Delete',
        index: {
          title: 'Tasks',
        },
        filter: {
          status: 'Status',
          executor: 'Executor',
          label: 'Label',
          myTasks: 'Only my tasks',
          submit: 'Show',
        },
        new: {
          title: 'Create task',
          submit: 'Create',
        },
        edit: {
          title: 'Edit task',
          submit: 'Edit',
        },
      },
      labels: {
        id: 'ID',
        name: 'Name',
        createdAt: 'Created at',
        actions: 'Actions',
        delete: 'Delete',
        index: {
          title: 'Labels',
        },
        new: {
          title: 'Create label',
          submit: 'Create',
        },
        edit: {
          title: 'Edit label',
          submit: 'Edit',
        },
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
    },
  },
};
