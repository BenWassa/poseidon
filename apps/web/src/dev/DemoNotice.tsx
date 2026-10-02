/**
 * Visible "this is a demo" messaging for the portfolio build.
 *
 * Rendered as a strip above the screens (through `App`'s `banner` prop) so it
 * pushes the layout rather than covering a header. It styles itself with a
 * scoped stylesheet, like `DevModeBadge`, so demo chrome stays out of the brand
 * tokens and out of every product screen. Only `bootstrapDemo` in `main.tsx`
 * supplies it.
 */

const STYLES = `
.poseidon-demo-notice {
  flex: none;
  padding: 6px 12px;
  background: #05323f;
  color: #f3fafa;
  font: 600 11px/1.3 ui-sans-serif, system-ui, -apple-system, sans-serif;
  letter-spacing: 0.02em;
  text-align: center;
}
.poseidon-demo-notice b {
  margin-right: 6px;
  color: #f7735c;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
`;

export function DemoNotice() {
  return (
    <div className="poseidon-demo-notice" role="note" data-testid="demo-notice">
      <style>{STYLES}</style>
      <b>Demo</b>
      Sample dives, nothing is saved. Reload to reset.
    </div>
  );
}
