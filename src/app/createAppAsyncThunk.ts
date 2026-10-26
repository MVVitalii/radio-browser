import { createAsyncThunk } from '@reduxjs/toolkit'
import { ApiError } from '../api/radioBrowser'
import type { AppDispatch, RootState } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
}>()

export const NETWORK_ERROR_MESSAGE = 'Не удалось связаться с Radio Browser. Проверьте соединение.'

/** Текст ошибки для UI: свои ошибки API показываем как есть, сетевые — общим сообщением. */
export const toErrorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : NETWORK_ERROR_MESSAGE
