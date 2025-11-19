import * as React from "react"
import { navigate } from 'gatsby';
import IndexPage from "./home";

const RealIndexPage = () => {
  React.useEffect(() => {
    navigate('/home');
  }, []);

  return <IndexPage></IndexPage>; // This page will redirect immediately
};

export default RealIndexPage;

export const Head = () => <title>Index</title>
