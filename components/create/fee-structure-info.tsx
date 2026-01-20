export function FeeStructureInfo() {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="relative mt-2 mb-6">
        {/* Connecting Line */}
        <div className="absolute top-1/2 right-[10%] left-[10%] h-1 -translate-y-1/2 rounded-full bg-primary/30" />

        {/* Market Cap Markers */}
        <div className="relative h-12 w-full">
          {/* 60k Marker */}
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2">
            <div className="relative z-10 box-border h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/20" />

            {/* Fee Above */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-bold text-foreground text-xs">
                0.95%
              </span>
            </div>

            {/* MC Below */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                &lt;$60k
              </span>
            </div>
          </div>

          {/* 300k Marker */}
          <div className="absolute top-1/2 left-[50%] -translate-y-1/2">
            <div className="relative z-10 box-border h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/20" />

            {/* Fee Above */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-bold text-foreground text-xs">
                0.50%
              </span>
            </div>

            {/* MC Below */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                $300k
              </span>
            </div>
          </div>

          {/* 2M Marker */}
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2">
            <div className="relative z-10 box-border h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm ring-2 ring-primary/20" />

            {/* Fee Above */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-bold text-foreground text-xs">
                0.05%
              </span>
            </div>

            {/* MC Below */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span className="block font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                $2M+
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted/30 p-3 text-muted-foreground text-xs">
        <p className="font-medium leading-relaxed">
          Fees start at <strong className="text-foreground">0.95%</strong> and
          decrease as market cap grows. Lower fees are needed at higher market
          caps to sustain growing volume.
        </p>
      </div>
    </div>
  );
}
