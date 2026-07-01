export function AuthFlowLoading({ label }: { label: string }) {
    return (
        <div className="rounded border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Loading {label}…
        </div>
    )
}
