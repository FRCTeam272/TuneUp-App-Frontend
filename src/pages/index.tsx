// "/" renders the main menu directly (same page as /home) instead of redirecting,
// so it works without JavaScript or a Netlify redirect.
import HomePage, { Head as HomeHead } from './home';

export default HomePage;
export const Head = HomeHead;
