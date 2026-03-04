export class AppError extends Error {
    constructor(
        public message: string = 'Internal server error',
        public statusCode = 500,
        public code = 'InternalServerException',
    ) {
        super(message);
    }
}

export class BusinessError extends AppError {
    constructor(statusCode: number, message = 'BusinessException') {
        super(message, statusCode, 'BusinessException');
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'NotFoundException') {
        super(message, 404, 'NotFoundException');
    }
}
