<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DoctorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Doctor::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:doctors',
            'specialty'      => 'required|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'license_number' => 'required|string|unique:doctors',
        ]);

        $doctor = Doctor::create($validated);

        return response()->json($doctor, 201);
    }

    public function show(Doctor $doctor): JsonResponse
    {
        return response()->json($doctor);
    }

    public function update(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:doctors,email,' . $doctor->id,
            'specialty' => 'sometimes|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'active'    => 'sometimes|boolean',
        ]);

        $doctor->update($validated);

        return response()->json($doctor);
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete(); // softDelete

        return response()->json(['message' => 'Doctor eliminado'], 200);
    }
}