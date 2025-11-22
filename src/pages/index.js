import * as React from "react"
import { navigate } from 'gatsby';

const RealIndexPage = () => {
  React.useEffect(() => {
    navigate('/home', { replace: true });
  }, []);

  return null; // Return null to prevent any content flash
};

export default RealIndexPage;

export const Head = () => <title>Index</title>
