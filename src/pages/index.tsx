import * as React from "react"
import { navigate, type HeadFC } from 'gatsby';

const RealIndexPage = () => {
  React.useEffect(() => {
    navigate('/home', { replace: true });
  }, []);

  return null; // Return null to prevent any content flash
};

export default RealIndexPage;

export const Head: HeadFC = () => <title>Index</title>
