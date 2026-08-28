/**
 * (public) group layout — reserved for future marketing/public pages.
 * Currently EMPTY: no pages live in this group yet. `/` stays in the (app)
 * group because the learning path is the landing view of the application
 * (it needs the Header + learning providers). When marketing pages arrive
 * (about, pricing, blog…), they go here and inherit this chrome-free layout.
 */
export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
