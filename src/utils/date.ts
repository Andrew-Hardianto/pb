// Format date string to display "28 Jul 2026"
export const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace('.', '');
};

// For date and time
export const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const d = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace('.', '');
    const time = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${d} ${time}`;
};
