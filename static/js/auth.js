// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Show/Hide modals
function showLoginForm() {
    $('#registerModal').modal('hide');
    $('#loginModal').modal('show');
}

function showRegisterForm() {
    $('#loginModal').modal('hide');
    $('#registerModal').modal('show');
}

function showUserMenu() {
    loadUserMeasurements();
    $('#userMenuModal').modal('show');
}

// Authentication functions
async function login(event) {
    event.preventDefault();
    const matrikelnummer = $('#loginMatrikelnummer').val();
    const password = $('#loginPassword').val();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matrikelnummer, password })
        });

        const data = await response.json();
        if (response.ok) {
            isAuthenticated = true;
            currentUser = data.user;
            $('#loginModal').modal('hide');
            updateAuthUI();
            showSuccessToast('Erfolgreich angemeldet!');
        } else {
            $('#loginError').text(data.error).removeClass('d-none');
        }
    } catch (error) {
        $('#loginError').text('Ein Fehler ist aufgetreten.').removeClass('d-none');
    }
}

async function register(event) {
    event.preventDefault();
    const matrikelnummer = $('#registerMatrikelnummer').val();
    const password = $('#registerPassword').val();
    const passwordConfirm = $('#registerPasswordConfirm').val();

    if (password !== passwordConfirm) {
        $('#registerError').text('Passwörter stimmen nicht überein.').removeClass('d-none');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matrikelnummer, password })
        });

        const data = await response.json();
        if (response.ok) {
            $('#registerModal').modal('hide');
            showLoginForm();
            showSuccessToast('Registrierung erfolgreich! Bitte melden Sie sich an.');
        } else {
            $('#registerError').text(data.error).removeClass('d-none');
        }
    } catch (error) {
        $('#registerError').text('Ein Fehler ist aufgetreten.').removeClass('d-none');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        isAuthenticated = false;
        currentUser = null;
        $('#userMenuModal').modal('hide');
        updateAuthUI();
        showSuccessToast('Erfolgreich abgemeldet!');
    } catch (error) {
        showErrorToast('Fehler beim Abmelden.');
    }
}

// User measurements
async function loadUserMeasurements() {
    if (!isAuthenticated) return;

    try {
        const response = await fetch('/api/measurements');
        const measurements = await response.json();
        
        const measurementsList = $('#measurementsList');
        measurementsList.empty();

        measurements.forEach(measurement => {
            const date = new Date(measurement.created_at).toLocaleDateString();
            const item = `
                <div class="list-group-item" data-measurement-id="${measurement._id}">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${measurement.product_name} (${measurement.product_number})</h5>
                        <small>${date}</small>
                    </div>
                    <p class="mb-1">Status: ${measurement.status}</p>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-primary" onclick="downloadMeasurement('${measurement._id}')">
                            <i class="fas fa-download"></i> Download CSV
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMeasurement('${measurement._id}')">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            `;
            measurementsList.append(item);
        });
    } catch (error) {
        console.error('Load error:', error);
        showErrorToast('Fehler beim Laden der Messungen.');
    }
}

async function downloadMeasurement(measurementId) {
    try {
        const response = await fetch(`/api/measurements/${measurementId}/download`);
        if (!response.ok) throw new Error('Download fehlgeschlagen');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `measurement_${measurementId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showErrorToast('Fehler beim Herunterladen der Messung.');
    }
}

async function deleteMeasurement(measurementId) {
    if (!confirm('Möchten Sie diese Messung wirklich löschen?')) return;

    try {
        const response = await fetch(`/api/measurements/${measurementId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            // Remove the measurement from the UI
            const measurementElement = document.querySelector(`[data-measurement-id="${measurementId}"]`);
            if (measurementElement) {
                measurementElement.remove();
            }
            showSuccessToast('Messung erfolgreich gelöscht.');
            
            // Reload the measurements list
            await loadUserMeasurements();
        } else {
            throw new Error(data.error || 'Löschen fehlgeschlagen');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showErrorToast(`Fehler beim Löschen der Messung: ${error.message}`);
    }
}

// UI updates
function updateAuthUI() {
    const authButton = $('#authButton');
    if (isAuthenticated) {
        authButton.html('<i class="fas fa-user"></i> Mein Konto')
            .removeClass('btn-outline-light')
            .addClass('btn-light')
            .off('click')
            .on('click', showUserMenu);
    } else {
        authButton.html('<i class="fas fa-sign-in-alt"></i> Anmelden')
            .removeClass('btn-light')
            .addClass('btn-outline-light')
            .off('click')
            .on('click', showLoginForm);
    }
}

// Toast notifications
function showSuccessToast(message) {
    // Implementation depends on your toast library
    console.log('Success:', message);
}

function showErrorToast(message) {
    // Implementation depends on your toast library
    console.error('Error:', message);
}

// Event listeners
$(document).ready(() => {
    $('#loginForm').on('submit', login);
    $('#registerForm').on('submit', register);
    updateAuthUI();
});
