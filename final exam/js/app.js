document.addEventListener('DOMContentLoaded', () => {
    const sessionUser = Storage.getCurrentUser();
    if (!sessionUser) return;

    // --- DYNAMIC NAVBAR CONTENT ROUTER ---
    const navLinks = document.getElementById('nav-role-links');
    const aptNavLinks = document.getElementById('appointment-nav-links');
    
    function injectNavbar(container) {
        if (!container) return;
        if (sessionUser.role === 'Admin') {
            container.innerHTML = `<a href="admin-dashboard.html">Doctors Management</a>
                                   <a href="patients.html" style="color:var(--primary-color); font-weight:bold;">Patients</a>
                                   <a href="appointments.html">Appointments</a>`;
        } else if (sessionUser.role === 'Receptionist') {
            container.innerHTML = `<a href="receptionist-dashboard.html">Dashboard</a>
                                   <a href="patients.html" style="color:var(--primary-color); font-weight:bold;">Patients</a>
                                   <a href="appointments.html">Appointments</a>`;
        }
    }
    injectNavbar(navLinks);
    injectNavbar(aptNavLinks);

    // --- RECEPTIONIST DASHBOARD GREETING ---
    const recepGreeting = document.getElementById('receptionist-name');
    if (recepGreeting) recepGreeting.innerText = sessionUser.name;


    
    // 1. PATIENTS MANAGEMENT SUBSYSTEM
    
    const patientForm = document.getElementById('patient-form');
    const patientsTableBody = document.getElementById('patients-table-body');
    const patientsEmpty = document.getElementById('patients-empty');
    const searchPatients = document.getElementById('search-patients');

    function renderPatientsTable(filterText = '') {
        if (!patientsTableBody) return;
        const patients = Storage.getPatients();
        patientsTableBody.innerHTML = '';

        const filtered = patients.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));

        if (filtered.length === 0) {
            patientsEmpty.style.display = 'block';
            return;
        }
        patientsEmpty.style.display = 'none';

        filtered.forEach(p => {
            const row = document.createElement('tr');
          //  Sahi Code (Is se badal dein)
row.innerHTML = `<td style="font-weight:600; color:var(--primary-color);">${p.id}</td>
                 <td>${p.name}</td>
                 <td>${p.age}</td>
                 <td>${p.gender}</td>
                 <td>${p.contact}</td>`;
            patientsTableBody.appendChild(row);
        });
    }

    if (patientForm) {
        patientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('patName').value.trim();
            const age = parseInt(document.getElementById('patAge').value);
            const gender = document.getElementById('patGender').value;
            const contact = document.getElementById('patContact').value.trim();

            const err = document.getElementById('patient-error');
            const succ = document.getElementById('patient-success');
            err.style.display = 'none'; succ.style.display = 'none';

            const patientsList = Storage.getPatients();
            const newPatId = 'p' + String(patientsList.length + 101).padStart(3, '0');

            const newPatient = { id: newPatId, name, age, gender, contact };
            Storage.savePatient(newPatient);

            succ.innerText = `Patient ${name} registered successfully with ID: ${newPatId}`;
            succ.style.display = 'block';
            patientForm.reset();
            renderPatientsTable();
        });
    }

    if (searchPatients) {
        searchPatients.addEventListener('input', (e) => {
            renderPatientsTable(e.target.value);
        });
    }



    // 2. APPOINTMENTS SCHEDULING SUBSYSTEM

    const appointmentForm = document.getElementById('appointment-form');
    const aptPatientDropdown = document.getElementById('aptPatient');
    const aptDoctorDropdown = document.getElementById('aptDoctor');
    const appointmentsTableBody = document.getElementById('appointments-table-body');
    const appointmentsEmpty = document.getElementById('appointments-empty');

    // Restrict date picker to prevent past dates
    const dateInput = document.getElementById('aptDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    function populateDropdowns() {
        if (!appointmentForm) return;
        
        const patients = Storage.getPatients();
        const doctors = Storage.getUsers().filter(u => u.role === 'Doctor');

        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.dataset.name = p.name;
            opt.innerText = `${p.name} (${p.id})`;
            aptPatientDropdown.appendChild(opt);
        });

        doctors.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.dataset.name = d.name;
            opt.innerText = d.name;
            aptDoctorDropdown.appendChild(opt);
        });
    }

    function renderAppointmentsTable() {
        if (!appointmentsTableBody) return;
        const appointments = Storage.getAppointments();
        appointmentsTableBody.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsEmpty.style.display = 'block';
            return;
        }
        appointmentsEmpty.style.display = 'none';

        appointments.forEach((apt, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${apt.patientName}</strong></td>
                <td>${apt.doctorName}</td>
                <td>${apt.date}</td>
                <td><span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
                <td style="text-align:center;">
                    <select class="form-control status-updater" data-index="${index}" style="padding:4px; font-size:0.85rem; width:130px; display:inline-block;">
                        <option value="Pending" ${apt.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${apt.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Done" ${apt.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
            `;
            appointmentsTableBody.appendChild(row);
        });

        attachStatusUpdaters();
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const patientId = aptPatientDropdown.value;
            const doctorId = aptDoctorDropdown.value;
            const date = dateInput.value;

            const patientName = aptPatientDropdown.options[aptPatientDropdown.selectedIndex].dataset.name;
            const doctorName = aptDoctorDropdown.options[aptDoctorDropdown.selectedIndex].dataset.name;

            const err = document.getElementById('apt-error');
            const succ = document.getElementById('apt-success');
            err.style.display = 'none'; succ.style.display = 'none';

            const appointments = Storage.getAppointments();
            const newAptId = 'a' + String(appointments.length + 101).padStart(3, '0');

            const newAppointment = {
                id: newAptId,
                patientId,
                patientName,
                doctorId,
                doctorName,
                date,
                status: 'Pending'
            };

            appointments.push(newAppointment);
            Storage.set('appointments', appointments);

            succ.innerText = 'Appointment scheduled successfully!';
            succ.style.display = 'block';
            appointmentForm.reset();
            renderAppointmentsTable();
        });
    }

    function attachStatusUpdaters() {
        const updaters = document.querySelectorAll('.status-updater');
        updaters.forEach(select => {
            select.addEventListener('change', function() {
                const index = this.getAttribute('data-index');
                const targetStatus = this.value;
                const appointments = Storage.getAppointments();

                appointments[index].status = targetStatus;
                Storage.set('appointments', appointments);
                renderAppointmentsTable();
            });
        });
    }

    // 3. DOCTOR DASHBOARD SUBSYSTEM (READ-ONLY)
   
    const doctorGreetingName = document.getElementById('doctor-name');
    const doctorAppointmentsBody = document.getElementById('doctor-appointments-body');
    const doctorEmptyView = document.getElementById('doctor-empty-view');

    if (doctorGreetingName && sessionUser) {
        doctorGreetingName.innerText = sessionUser.name;
    }

    function renderDoctorAppointments() {
        if (!doctorAppointmentsBody) return; 

        const allAppointments = Storage.getAppointments();
        
        const myAppointments = allAppointments.filter(apt => apt.doctorId === sessionUser.id);

        doctorAppointmentsBody.innerHTML = '';

        if (myAppointments.length === 0) {
            if (doctorEmptyView) doctorEmptyView.style.display = 'block';
            return;
        } else {
            if (doctorEmptyView) doctorEmptyView.style.display = 'none';
        }

        myAppointments.forEach(apt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span style="color: var(--text-light); font-weight: 600;">${apt.patientId}</span></td>
                <td><strong>${apt.patientName}</strong></td>
                <td>${apt.date}</td>
                <td style="text-align: center;">
                    <span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
                </td>
            `;
            doctorAppointmentsBody.appendChild(row);
        });
    }



 // --- INITIALIZATION EXECUTION LAYERS ---
    renderPatientsTable();
    populateDropdowns();
    renderAppointmentsTable();
    renderDoctorAppointments();
});