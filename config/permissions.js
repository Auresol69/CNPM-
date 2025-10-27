const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    DRIVER: 'Driver',
    PARENT: 'Parent'
};

const permissions = {
    // Model: users
    users: {
        create: [ROLES.ADMIN],
        readAll: [ROLES.ADMIN],
        readOne: [ROLES.ADMIN],
        update: [ROLES.ADMIN],
        delete: [ROLES.ADMIN]
    },
    // Model: buses
    buses: {
        create: [ROLES.ADMIN],
        readAll: [ROLES.ADMIN, ROLES.MANAGER],
        readOne: [ROLES.ADMIN, ROLES.MANAGER],
        update: [ROLES.ADMIN],
        delete: [ROLES.ADMIN]
    },
    // Model: schedules
    schedules: {
        create: [ROLES.ADMIN, ROLES.MANAGER],
        readAll: [ROLES.ADMIN, ROLES.MANAGER, ROLES.DRIVER, ROLES.PARENT],
        readOne: [ROLES.ADMIN, ROLES.MANAGER, ROLES.DRIVER, ROLES.PARENT],
        update: [ROLES.ADMIN, ROLES.MANAGER],
        delete: [ROLES.ADMIN, ROLES.MANAGER]
    },
    students: {
        // Ví dụ: Chỉ Admin/Manager được xem tất cả học sinh, 
        // nhưng Phụ huynh chỉ xem được thông tin của con mình (logic xử lý riêng)
        readAll: [ROLES.ADMIN, ROLES.MANAGER],
        readOne: [ROLES.ADMIN, ROLES.MANAGER, ROLES.PARENT],
        update: [ROLES.ADMIN, ROLES.MANAGER],
        // ...
    }
};

module.exports = permissions;
