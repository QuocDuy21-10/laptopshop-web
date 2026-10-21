# SDD ledger — plan: /Users/dinhduy/Workspace/nodejs/laptopshop-api/docs/superpowers/plans/2026-10-20-advanced-product-facets.md

Execution method: Native / executing-plans.
Web workspace: `/Users/dinhduy/Workspace/nodejs/laptopshop-web` on `codex/advanced-product-facets`.
API public contract is committed through Task 6 on `codex/advanced-product-facets-design`.

### Rulings

- Task 7: Ruling: expose normalized Product fields and `facetDefinitions` as optional in frontend convenience aliases while keeping generated `schema.d.ts` exact — API response is additive and existing web fixtures/components use partial Product/catalog mocks; cost if wrong: a caller could omit a field that the live API always sends, but new UI paths handle missing data safely.
- Task 8: Ruling: update existing Filters/ActiveFilterChips fixtures while expanding URL filters — old test fixtures construct the pre-facet ProductFilters shape, and clear-all must now clear every advanced array; cost if wrong: stale fixtures or chips could drop advanced filters from URLs.
- Task 12: Ruling: do not alter unrelated checkout/advisor E2E flows — focused facet E2E passes 2/2, while the full storefront suite still has pre-existing checkout redirect and advisor score-display failures; cost if wrong: whole-file E2E is not green until those separate regressions/environment issues are addressed.

## Task status

- Task 7: pending
- Task 8: pending
- Task 9: pending
- Task 10: pending
- Task 11: pending
- Task 12: pending
Task 7: complete (commits 8e115e1..f1e2158, tests: npm test -- tests/features/admin/ProductForm.test.tsx →    Duration  2.68s (tests 47%, import 38%, environment 11%, setup 3%, transform 1%))
Task 8: complete (commits f1e2158..4e38e3e, tests: npm test -- tests/features/search-params.test.ts →    Duration  732ms (environment 81%, setup 14%, transform 3%, worker 1%, tests 1%))
Task 9: complete (commits 4e38e3e..c353b6d, tests: npm test -- tests/features/FilterControls.test.tsx tests/features/DesktopFilters.test.tsx →    Duration  1.13s (environment 49%, transform 18%, tests 12%, import 12%, setup 9%))
Task 10: complete (commits c353b6d..92bec0f, tests: npm test -- tests/features/FilterSheet.test.tsx →    Duration  666ms (environment 46%, tests 25%, import 16%, setup 8%, transform 4%))
Task 11: complete (commits 92bec0f..dc6d7ff, tests: npm test -- tests/lib/server-api.test.ts tests/features/products-metadata.test.ts tests/features/search-params.test.ts tests/features/FilterControls.test.tsx tests/features/FilterSheet.test.tsx →    Duration  1.57s (environment 62%, import 18%, setup 11%, tests 7%, transform 1%))
Task 12: complete (commits dc6d7ff..550d1ef, tests: npm run e2e -- e2e/storefront.spec.ts --config=playwright.facets.local.config.ts --grep 'dynamic facets|mobile facet' →   2 passed (4.8s))
Final review: important issues fixed in 219da0a — mobile Apply only trusts a fresh preview key, desktop selections retain optimistic pending state across rapid clicks, and admin normalized selects are clearable with dependent GPU/CPU validation and clear flow. Added regression coverage; all web gates pass.
Final review: minor `INVALID_PRODUCT_SPECS` field-detail mapping remains deferred because it is outside the approved facet interaction scope.
