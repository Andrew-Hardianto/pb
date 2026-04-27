import { dismissLoading } from '../services/main-service.service';
// import { swalService } from '../services/swalService';

let errorMessage: string = "";

export function handleHttpError(err: any, page?: string): void {
    dismissLoading();

    if (err?.response?.status === 403) {
        errorMessage = err.response.data?.message ?? 'Forbidden';
        return;
    }

    if (err?.response) {
        handleKnownStatusError(err);
        if (err.response.status !== 503 && err.response.status !== 401) {
            // swalService.present(errorMessage, 'error');
        }
    } else {
        errorMessage =
            "Can't connect to server. Please check your connection!";
        // swalService.present(errorMessage, 'error');
    }
}

export function handleHttpErrorLogin(err: any): void {
    dismissLoading();

    if (err?.response) {
        handleKnownStatusError(err);
    } else {
        errorMessage =
            "Can't connect to server. Please check your connection!";
    }

    if (err?.response?.status !== 503) {
        // swalService.present(errorMessage, 'error');
    }
}

function handleKnownStatusError(err: any): void {
    const status = err.response?.status;
    const data = err.response?.data;

    if (isClientOrServerError(status)) {
        errorMessage = extractErrorMessage(err);
    } else if (data?.detail === 'Maximum upload size exceeded') {
        errorMessage = 'File size maximum 5MB';
    } else {
        errorMessage = "Can't connect to server. Please Contact Admin!";
    }
}

function isClientOrServerError(status: number): boolean {
    return status === 401 || status === 400 || String(status).startsWith('5');
}

function extractErrorMessage(err: any): string {
    const error = err.response?.data;
    if (!error) return '';

    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    if (error.detail) return error.detail;
    return error.error ?? "Can't connect to server. Please check your connection!";
}
