export default function AccountPageSkeleton() {
    return (
        <div className="w-full ">
            <div className="flex md:flex-row flex-col gap-8 animate-pulse">
                {/* Right Content Skeleton */}
                <div className="md:w-3/4 w-full space-y-6">
                    {/* Title */}
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>

                    {/* Form fields */}
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
