import { createError } from 'apollo-errors';

export const UnknownError = createError('UnknownError', {
  message: 'An unknown error has occured'
});

export const NotFoundError = createError('NotFoundError', {
  message: 'Item not found'
});

export const ApiError = createError('ApiError', {
  message: 'Api error'
});

export const AuthorizationError = createError('AuthorizationError', {
  message: 'You must login to do that'
});

export const ForbiddenError = createError('ForbiddenError', {
  message: 'You`re not allowed to do that'
});
