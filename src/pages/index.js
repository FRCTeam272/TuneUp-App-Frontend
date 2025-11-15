import * as React from "react"
import { navigate } from 'gatsby';

const IndexPage = () => {
  React.useEffect(() => {
    navigate('/home');
  }, []);

  return <>Redirecting...</>; // This page will redirect immediately
};

export default IndexPage;

export const Head = () => <title>Redirecting...</title>
