import { gql } from '@apollo/client';

// ============================================
// Authentication Queries
// ============================================

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      status
      createdat
      updatedat
    }
  }
`;

// ============================================
// Mail Setup Queries
// ============================================

export const GET_MAIL_SETUP = gql`
  query GetMailSetup {
    getMailSetup {
      id
      smtphost
      smtpport
      smtpuser
      smtppassword
      enablessl
      sendername
      senderemail
      createdat
      updatedat
    }
  }
`;

// ============================================
// Customer Queries
// ============================================

export const GET_CUSTOMERS = gql`
  query GetCustomers($page: Int, $limit: Int, $search: String, $status: String) {
    customers(page: $page, limit: $limit, search: $search, status: $status) {
      data {
        id
        name
        details
        contactPerson
        email
        address
        status
        createdat
        updatedat
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_CUSTOMER = gql`
  query GetCustomer($id: Int!) {
    customer(id: $id) {
      id
      name
      details
      contactPerson
      email
      address
      status
      createdat
      updatedat
      locations {
        id
        customerId
        displayName
        location
        contactPerson
        email
        phone1
        phone2
        address
        city
        state
        pin
        gstin
        pan
        status
        createdat
        updatedat
      }
    }
  }
`;

// ============================================
// Customer Location Queries
// ============================================

export const GET_CUSTOMER_LOCATIONS = gql`
  query GetCustomerLocations($page: Int, $limit: Int, $search: String, $status: String, $customerId: Int) {
    customerLocations(page: $page, limit: $limit, search: $search, status: $status, customerId: $customerId) {
      data {
        id
        customerId
        displayName
        location
        contactPerson
        email
        phone1
        phone2
        address
        city
        state
        pin
        gstin
        pan
        status
        createdat
        updatedat
        customer {
          id
          name
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_CUSTOMER_LOCATION = gql`
  query GetCustomerLocation($id: Int!) {
    customerLocation(id: $id) {
      id
      customerId
      displayName
      location
      contactPerson
      email
      phone1
      phone2
      address
      city
      state
      pin
      gstin
      pan
      status
      createdat
      updatedat
      customer {
        id
        name
      }
    }
  }
`;

// ============================================
// Brand Queries
// ============================================

export const GET_BRANDS = gql`
  query GetBrands($page: Int, $limit: Int, $search: String, $status: String) {
    brands(page: $page, limit: $limit, search: $search, status: $status) {
      data {
        id
        name
        details
        status
        createdat
        updatedat
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_BRAND = gql`
  query GetBrand($id: Int!) {
    brand(id: $id) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

// ============================================
// Category Queries
// ============================================

export const GET_CATEGORIES = gql`
  query GetCategories($page: Int, $limit: Int, $search: String, $status: String) {
    categories(page: $page, limit: $limit, search: $search, status: $status) {
      data {
        id
        name
        details
        status
        createdat
        updatedat
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: Int!) {
    category(id: $id) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

// ============================================
// Product Queries
// ============================================

export const GET_PRODUCTS = gql`
  query GetProducts($page: Int, $limit: Int, $search: String, $status: String, $brandId: Int, $categoryId: Int) {
    products(page: $page, limit: $limit, search: $search, status: $status, brandId: $brandId, categoryId: $categoryId) {
      data {
        id
        name
        details
        brandId
        categoryId
        model
        status
        createdat
        updatedat
        brand {
          id
          name
        }
        category {
          id
          name
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: Int!) {
    product(id: $id) {
      id
      name
      details
      brandId
      categoryId
      model
      status
      createdat
      updatedat
      brand {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`;

// ============================================
// Invoice Queries
// ============================================

export const GET_INVOICES = gql`
  query GetInvoices($page: Int, $limit: Int, $search: String, $status: String, $customerId: Int) {
    invoices(page: $page, limit: $limit, search: $search, status: $status, customerId: $customerId) {
      data {
        id
        customerId
        locationId
        invoiceNo
        invoiceDate
        total
        discount
        subtotal
        grandTotal
        status
        createdat
        updatedat
        customer {
          id
          name
        }
        location {
          id
          displayName
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_INVOICE = gql`
  query GetInvoice($id: Int!) {
    invoice(id: $id) {
      id
      customerId
      locationId
      invoiceNo
      invoiceDate
      total
      discount
      subtotal
      grandTotal
      status
      createdat
      updatedat
      customer {
        id
        name
      }
      location {
        id
        displayName
      }
      items {
        id
        invoiceId
        productId
        serialNo
        quantity
        amount
        createdat
        updatedat
        product {
          id
          name
          model
          brand {
            id
            name
          }
          category {
            id
            name
          }
        }
      }
    }
  }
`;

// ============================================
// Invoice Item Queries
// ============================================

export const GET_INVOICE_ITEMS = gql`
  query GetInvoiceItems($page: Int, $limit: Int, $invoiceId: Int) {
    invoiceItems(page: $page, limit: $limit, invoiceId: $invoiceId) {
      data {
        id
        invoiceId
        productId
        serialNo
        quantity
        amount
        createdat
        updatedat
        product {
          id
          name
          model
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_INVOICE_ITEM = gql`
  query GetInvoiceItem($id: Int!) {
    invoiceItem(id: $id) {
      id
      invoiceId
      productId
      serialNo
      quantity
      amount
      createdat
      updatedat
      product {
        id
        name
        model
      }
    }
  }
`;

// ============================================
// AMC Proposal Queries
// ============================================

export const GET_AMC_PROPOSALS = gql`
  query GetAmcProposals($page: Int, $limit: Int, $search: String, $status: String, $customerId: Int) {
    amcProposals(page: $page, limit: $limit, search: $search, status: $status, customerId: $customerId) {
      data {
        id
        proposalno
        proposaldate
        amcstartdate
        amcenddate
        customerId
        contractno
        billingaddress
        total
        additionalcharge
        discount
        taxrate
        taxamount
        grandtotal
        proposalstatus
        createdat
        updatedat
        customer {
          id
          name
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_AMC_PROPOSAL = gql`
  query GetAmcProposal($id: Int!) {
    amcProposal(id: $id) {
      id
      proposalno
      proposaldate
      amcstartdate
      amcenddate
      customerId
      contractno
      billingaddress
      doclink
      termsconditions
      total
      additionalcharge
      discount
      taxrate
      taxamount
      grandtotal
      proposalstatus
      createdat
      updatedat
      customer {
        id
        name
        email
      }
      items {
        id
        proposalId
        locationId
        invoiceId
        productId
        serialno
        saccode
        quantity
        rate
        amount
        createdat
        updatedat
        location {
          id
          displayName
        }
        invoice {
          id
          invoiceNo
        }
        product {
          id
          name
          model
          brand {
            id
            name
          }
          category {
            id
            name
          }
        }
      }
    }
  }
`;

// ============================================
// Proposal Item Queries
// ============================================

export const GET_PROPOSAL_ITEMS = gql`
  query GetProposalItems($page: Int, $limit: Int, $proposalId: Int) {
    proposalItems(page: $page, limit: $limit, proposalId: $proposalId) {
      data {
        id
        proposalId
        locationId
        invoiceId
        productId
        serialno
        saccode
        quantity
        rate
        amount
        createdat
        updatedat
        location {
          id
          displayName
        }
        invoice {
          id
          invoiceNo
        }
        product {
          id
          name
          model
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_PROPOSAL_ITEM = gql`
  query GetProposalItem($id: Int!) {
    proposalItem(id: $id) {
      id
      proposalId
      locationId
      invoiceId
      productId
      serialno
      saccode
      quantity
      rate
      amount
      createdat
      updatedat
      location {
        id
        displayName
      }
      invoice {
        id
        invoiceNo
      }
      product {
        id
        name
        model
      }
    }
  }
`;

// ============================================
// Proposal Document Queries
// ============================================

export const GET_PROPOSAL_DOCUMENTS = gql`
  query GetProposalDocuments($page: Int, $limit: Int, $proposalno: String) {
    proposalDocuments(page: $page, limit: $limit, proposalno: $proposalno) {
      data {
        id
        proposalno
        doclink
        createdby
        createdat
        updatedat
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_PROPOSAL_DOCUMENT = gql`
  query GetProposalDocument($id: Int!) {
    proposalDocument(id: $id) {
      id
      proposalno
      doclink
      createdby
      createdat
      updatedat
    }
  }
`;

// ============================================
// Email Record Queries
// ============================================

export const GET_EMAIL_RECORDS = gql`
  query GetEmailRecords($page: Int, $limit: Int, $proposalno: String) {
    emailRecords(page: $page, limit: $limit, proposalno: $proposalno) {
      data {
        id
        proposalno
        email
        status
        sentby
        message
        createdat
        updatedat
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_EMAIL_RECORD = gql`
  query GetEmailRecord($id: Int!) {
    emailRecord(id: $id) {
      id
      proposalno
      email
      status
      sentby
      message
      createdat
      updatedat
    }
  }
`;
