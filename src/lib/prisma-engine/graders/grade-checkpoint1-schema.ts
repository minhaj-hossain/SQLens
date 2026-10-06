/**
 * Milestone 1 Checkpoint Behavioral Grader — Catalog & Review Data Modeling.
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the e-commerce catalog schema AST against strict architectural invariants:
 *  1. enum ProductStatus (DRAFT, PUBLISHED, ARCHIVED).
 *  2. 1:1 relation: ProductDetail.productId must strictly declare @unique foreign key.
 *  3. 1:N relation: Product -> Review[] and Review -> Product.
 *  4. M:N relation: Product <-> Category (implicit or explicit join table).
 *  5. Composite index on Review: @@index([productId, createdAt]). Rejects single-column indexes.
 */

import { parsePrismaSchema, findModel } from '../prisma-schema-parser';
import type { BehavioralGraderResult } from './grade-day6-singleton';

export function gradeCheckpoint1Schema(code: string, _taskId: string): BehavioralGraderResult {
  const schema = parsePrismaSchema(code);

  if (schema.models.length === 0 && schema.enums.length === 0) {
    return {
      passed: false,
      feedback:
        'No models or enums found in schema. Define enum ProductStatus and models Product, ProductDetail, Review, and Category.',
    };
  }

  // 1. Enum ProductStatus validation
  const statusEnum = schema.enums.find((e) => e.name === 'ProductStatus');
  if (!statusEnum) {
    return {
      passed: false,
      feedback:
        'Missing enum ProductStatus. Define an enum ProductStatus with variants DRAFT, PUBLISHED, and ARCHIVED. (Remediation: Revisit Day 3 Concept 2: Enums & Constraints)',
    };
  }

  const requiredVariants = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
  const hasAllVariants = requiredVariants.every((v) => statusEnum.values.includes(v));
  if (!hasAllVariants) {
    return {
      passed: false,
      feedback:
        'enum ProductStatus must include DRAFT, PUBLISHED, and ARCHIVED. (Remediation: Revisit Day 3 Concept 2: Enums & Constraints)',
    };
  }

  // 2. Model Product
  const productModel = findModel(schema, 'Product');
  if (!productModel) {
    return {
      passed: false,
      feedback:
        'Missing model Product. Define model Product with id, title, status, and relations. (Remediation: Revisit Day 3 Concept 1: Model Declarations)',
    };
  }

  // 3. Model ProductDetail (1:1 with Product)
  const detailModel = findModel(schema, 'ProductDetail');
  if (!detailModel) {
    return {
      passed: false,
      feedback:
        'Missing model ProductDetail. (Remediation: Revisit Day 4 Concept 2: 1:1 Relations)',
    };
  }

  const productIdField = detailModel.fields.find((f) => f.name === 'productId');
  if (!productIdField) {
    return {
      passed: false,
      feedback:
        'Missing foreign key field productId on ProductDetail. (Remediation: Revisit Day 4 Concept 2: 1:1 Relations)',
    };
  }

  // Strictly assert @unique on the 1:1 foreign key
  const hasUniqueOnFk =
    productIdField.attributes.some((attr) => attr.startsWith('@unique')) ||
    (detailModel.blockAttributes &&
      detailModel.blockAttributes.some((attr) =>
        /@@unique\s*\(\s*\[\s*productId\s*\]\s*\)/.test(attr),
      ));

  if (!hasUniqueOnFk) {
    return {
      passed: false,
      feedback:
        'ProductDetail.productId must have @unique. In Prisma, a 1:1 relation requires a unique constraint on the foreign key column; otherwise Prisma models it as 1:N. (Remediation: Revisit Day 4 Concept 2: 1:1 Relations)',
    };
  }

  const detailProductRelation = detailModel.fields.find((f) => f.baseType === 'Product');
  const productDetailRelation = productModel.fields.find((f) => f.baseType === 'ProductDetail');
  if (!detailProductRelation || !productDetailRelation) {
    return {
      passed: false,
      feedback:
        'Missing 1:1 relation fields between Product and ProductDetail. Product should have detail ProductDetail? and ProductDetail should reference Product. (Remediation: Revisit Day 4 Concept 2: 1:1 Relations)',
    };
  }

  // 4. Model Review (1:N with Product)
  const reviewModel = findModel(schema, 'Review');
  if (!reviewModel) {
    return {
      passed: false,
      feedback:
        'Missing model Review. (Remediation: Revisit Day 4 Concept 1: One-to-Many Relations)',
    };
  }

  const reviewFk = reviewModel.fields.find((f) => f.name === 'productId');
  if (!reviewFk) {
    return {
      passed: false,
      feedback:
        'Missing foreign key field productId on Review. (Remediation: Revisit Day 4 Concept 1: One-to-Many Relations)',
    };
  }

  const productReviewsField = productModel.fields.find(
    (f) => f.baseType === 'Review' && f.isList,
  );
  const reviewProductField = reviewModel.fields.find((f) => f.baseType === 'Product');
  if (!productReviewsField || !reviewProductField) {
    return {
      passed: false,
      feedback:
        'Missing 1:N relationship between Product and Review. Product should have reviews Review[], and Review should reference Product. (Remediation: Revisit Day 4 Concept 1: One-to-Many Relations)',
    };
  }

  // Composite index on Review: @@index([productId, createdAt])
  const compositePattern =
    /@@index\s*\(\s*\[\s*productId\s*,\s*createdAt(?:\s*\(\s*sort\s*:\s*(?:Desc|Asc)\s*\))?\s*\]\s*\)/i;
  const singleColumnCreatedAtPattern =
    /@@index\s*\(\s*\[\s*createdAt(?:\s*\(\s*sort\s*:\s*(?:Desc|Asc)\s*\))?\s*\]\s*\)/i;
  const singleColumnProductIdPattern =
    /@@index\s*\(\s*\[\s*productId(?:\s*\(\s*sort\s*:\s*(?:Desc|Asc)\s*\))?\s*\]\s*\)/i;

  const blockAttrs = reviewModel.blockAttributes ?? [];
  const hasCompositeIndex = blockAttrs.some((attr) => compositePattern.test(attr));
  const hasSingleCreatedAt = blockAttrs.some((attr) => singleColumnCreatedAtPattern.test(attr));
  const hasSingleProductId = blockAttrs.some((attr) => singleColumnProductIdPattern.test(attr));

  if (hasSingleCreatedAt || hasSingleProductId) {
    return {
      passed: false,
      feedback:
        'A single-column index on createdAt cannot serve both the filter (where productId) and sort (orderBy createdAt) efficiently. Use a composite index: @@index([productId, createdAt]). (Remediation: Revisit Day 3 Concept 2: Indexes)',
    };
  }

  if (!hasCompositeIndex) {
    return {
      passed: false,
      feedback:
        'Missing composite index on Review. To support fast lookups of reviews for a product ordered by date, add @@index([productId, createdAt]). (Remediation: Revisit Day 3 Concept 2: Indexes)',
    };
  }

  // 5. Model Category & M:N relationship
  const categoryModel = findModel(schema, 'Category');
  if (!categoryModel) {
    return {
      passed: false,
      feedback:
        'Missing model Category. (Remediation: Revisit Day 4 Concept 3: Many-to-Many Relations)',
    };
  }

  const implicitProductCat = productModel.fields.some(
    (f) => f.baseType === 'Category' && f.isList,
  );
  const implicitCatProduct = categoryModel.fields.some(
    (f) => f.baseType === 'Product' && f.isList,
  );
  const hasImplicitMN = implicitProductCat && implicitCatProduct;

  // Also support explicit join table
  const hasExplicitMN = schema.models.some((m) => {
    const hasProductRel = m.fields.some((f) => f.baseType === 'Product');
    const hasCatRel = m.fields.some((f) => f.baseType === 'Category');
    return hasProductRel && hasCatRel && m.name !== 'Product' && m.name !== 'Category';
  });

  if (!hasImplicitMN && !hasExplicitMN) {
    return {
      passed: false,
      feedback:
        'Missing many-to-many relationship between Product and Category. (Remediation: Revisit Day 4 Concept 3: Many-to-Many Relations)',
    };
  }

  return { passed: true };
}
