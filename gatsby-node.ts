/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */
import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = async () => {
  // No special routing needed for query string approach
  // The /team page will handle query parameters naturally
};
