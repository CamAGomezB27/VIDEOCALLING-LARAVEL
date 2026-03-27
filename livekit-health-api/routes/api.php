<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AppointmentChatController;

// Esta ruta DEBE estar antes del apiResource
Route::get('appointments/{appointment}/join', [AppointmentController::class, 'join']);

Route::apiResource('doctors', DoctorController::class);
Route::apiResource('patients', PatientController::class);
Route::apiResource('appointments', AppointmentController::class);

Route::post('appointments/{appointment}/recording/start', [AppointmentController::class, 'startRecording']);
Route::post('appointments/{appointment}/recording/stop',  [AppointmentController::class, 'stopRecording']);
Route::get('/appointments/{appointment}/chat', [AppointmentChatController::class, 'index']);
Route::post('/appointments/{appointment}/chat', [AppointmentChatController::class, 'store']);
Route::post('/appointments/{appointment}/end', [AppointmentController::class, 'endMeeting']);