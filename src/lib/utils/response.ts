import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation error',
      details: error.issues,
    },
    { status: 400 }
  )
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function notFoundResponse(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function serverErrorResponse() {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

