const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    getUsers() {
        const users = this.get('users');
        return Array.isArray(users) ? users : [];
    },
    
    saveUser(userObj) {
        const users = this.getUsers();
        users.push(userObj);
        this.set('users', users);
    },

    getPatients() {
        const patients = this.get('patients');
        return Array.isArray(patients) ? patients : [];
    },

    savePatient(patientObj) {
        const patients = this.getPatients();
        patients.push(patientObj);
        this.set('patients', patients);
    },

    getAppointments() {
        const appointments = this.get('appointments');
        return Array.isArray(appointments) ? appointments : [];
    },

    getCurrentUser() {
        return this.get('currentUser');
    },

    setCurrentUser(userObj) {
        this.set('currentUser', userObj);
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    checkAuth(allowedRoles) {
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
            if (currentUser.role === 'Admin') window.location.href = 'admin-dashboard.html';
            else if (currentUser.role === 'Doctor') window.location.href = 'doctor-dashboard.html';
            else if (currentUser.role === 'Receptionist') window.location.href = 'receptionist-dashboard.html';
        }
    }
};