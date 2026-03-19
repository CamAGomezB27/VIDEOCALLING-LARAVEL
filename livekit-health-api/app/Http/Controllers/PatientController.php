<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Patient::all());
    }

    public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name'            => 'required|string|max:255',
        'email'           => 'required|email|unique:patients',
        'phone'           => 'nullable|string|max:20',
        'birth_date'      => 'nullable|date',
        'document_number' => 'required|string|unique:patients',
        'notes'           => 'nullable|string',
    ]);

    $patient = Patient::create($validated);

    return response()->json($patient, 201);
}
// el resto de métodos igual que DoctorController pero con Patient

    public function show(Patient $patient): JsonResponse
    {
        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:patients,email,' . $patient->id,
            'phone'     => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'document_number' => 'sometimes|string|unique:patients,document_number,' . $patient->id,
            'notes'     => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete(); // softDelete

        return response()->json(['message' => 'Patient eliminado'], 200);
    }
}