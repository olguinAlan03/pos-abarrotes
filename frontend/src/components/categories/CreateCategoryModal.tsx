import React, { useState } from 'react'

interface CreateCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onCategoryCreated: () => void
}

export function CreateCategoryModal({
                                        isOpen,
                                        onClose,
                                        onCategoryCreated,
                                    }: CreateCategoryModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [nameError, setNameError] = useState<string | null>(null)

    if (!isOpen) return null

    function handleClose() {
        setName('')
        setDescription('')
        setNameError(null)
        setError(null)
        onClose()
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            setNameError('El nombre de la categoría es obligatorio')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const rawAuth = localStorage.getItem('auth-storage')
            const authData = rawAuth ? JSON.parse(rawAuth) : null
            const token = authData?.state?.accessToken || localStorage.getItem('token')

            const response = await fetch('http://localhost:3000/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: name.trim(), description: description.trim() }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                let errorMessage = 'Error al crear la categoría'

                const msg = errorData.message
                if (typeof msg === 'string') {
                    errorMessage = msg
                } else if (Array.isArray(msg)) {
                    errorMessage = msg.join(', ')
                } else if (msg && typeof msg === 'object') {
                    if (typeof msg.message === 'string') {
                        errorMessage = msg.message
                    } else if (Array.isArray(msg.message)) {
                        errorMessage = msg.message.join(', ')
                    }
                }

                if (response.status === 403) {
                    errorMessage = 'No tienes permisos suficientes (Reinicio de sesión requerido)'
                }

                throw new Error(errorMessage)
            }

            handleClose()
            onCategoryCreated()
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Nueva Categoría</h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (e.target.value.trim()) {
                                    setNameError(null)
                                }
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                                nameError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800'
                            }`}
                            placeholder="Ej. Bebidas, Abarrotes..."
                        />
                        {nameError && (
                            <p className="mt-1 text-xs font-medium text-red-500">
                                {nameError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Descripción
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800 resize-none"
                            placeholder="Descripción opcional"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}