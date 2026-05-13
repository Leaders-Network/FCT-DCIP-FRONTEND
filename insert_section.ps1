$file = 'C:\Users\Bolajeee\Documents\LeadersNetwork\Builders-Liability-FRONTEND\src\app\broker-admin\dashboard\page.tsx'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$search = "            {/* Claim Detail Modal - Same as claims page */}"
$idx = $content.IndexOf($search)
Write-Host "Found at index: $idx  Total length: $($content.Length)"

if ($idx -lt 0) {
    Write-Error "Search string not found!"
    exit 1
}

$newSection = @"

            {/* ── Completed Policies Section ──────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
                {/* Section header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Completed Policies (NIIP)
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            All policies with payment completed — filterable by date range and insurance broker company.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{completedTotal} record{completedTotal !== 1 ? 's' : ''}</span>
                        <button
                            onClick={handleExportCompletedCsv}
                            disabled={csvExporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                            {csvExporting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {csvExporting ? 'Exporting…' : 'Download CSV'}
                        </button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search policy number or builder…"
                                value={cpSearch}
                                onChange={(e) => setCpSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCpFilters()}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Broker company name filter */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Insurance broker company name…"
                                value={cpCompanyName}
                                onChange={(e) => setCpCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCpFilters()}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date From */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={cpDateFrom}
                                onChange={(e) => setCpDateFrom(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={cpDateTo}
                                onChange={(e) => setCpDateTo(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Apply / Clear */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleApplyCpFilters}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                            >
                                <Filter className="w-4 h-4" />
                                Apply
                            </button>
                            {(appliedCpSearch || appliedCpCompanyName || appliedCpDateFrom || appliedCpDateTo) && (
                                <button
                                    onClick={handleClearCpFilters}
                                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {completedError && (
                    <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {completedError}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Builder Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LGA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sum Insured (N)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Broker Company</span>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {completedLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                        </div>
                                    </td>
                                </tr>
                            ) : completedPolicies.length > 0 ? (
                                completedPolicies.map((policy) => {
                                    const builder = (policy.builder as Record<string, unknown>) || {};
                                    const project = (policy.project as Record<string, unknown>) || {};
                                    const paymentInfo = policy.paymentInfo as Record<string, unknown> | undefined;
                                    const niipPayload = policy.niipPayload as Record<string, unknown> | undefined;
                                    const meta = policy.meta as Record<string, unknown> | undefined;
                                    const webhookNiip = (paymentInfo?.webhookData as Record<string, unknown> | undefined)?.niip as Record<string, unknown> | undefined;
                                    const brokerCompany =
                                        (niipPayload?.companyName as string) ||
                                        (webhookNiip?.companyName as string) ||
                                        (meta?.brokerOrAgentName as string) ||
                                        '';
                                    return (
                                        <tr key={String(policy._id)} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {String(policy.policyNumber || policy.referenceNumber || policy._id)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {String(builder.nameOfBuilder || '—')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {String(builder.customerEmail || '—')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {String(project.lga || '—')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {project.totalEstimateSum != null
                                                    ? formatCurrency(Number(project.totalEstimateSum))
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {brokerCompany ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        <Building2 className="w-3 h-3" />
                                                        {brokerCompany}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {policy.updatedAt ? formatDate(String(policy.updatedAt)) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <CheckCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">No completed policies found.</p>
                                        {(appliedCpSearch || appliedCpCompanyName || appliedCpDateFrom || appliedCpDateTo) && (
                                            <button onClick={handleClearCpFilters} className="mt-2 text-indigo-600 text-sm hover:underline">Clear filters</button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {completedTotalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Page {completedPage} of {completedTotalPages} - {completedTotal} total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                                disabled={completedPage === 1}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setCompletedPage(p => Math.min(completedTotalPages, p + 1))}
                                disabled={completedPage === completedTotalPages}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

"@

$newContent = $content.Substring(0, $idx) + $newSection + $content.Substring($idx)
[System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Done! New file length: $($newContent.Length)"
