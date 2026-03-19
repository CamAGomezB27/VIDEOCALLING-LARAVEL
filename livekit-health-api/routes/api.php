<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;

Route::apiResource('doctors', DoctorController::class);
Route::apiResource('patients', PatientController::class);