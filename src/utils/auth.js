// Create a utility file for auth-related functions:

export const logout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');

    if (navigate) {
        navigate('/');
    } else {
        window.location.href = '/';
    }
};