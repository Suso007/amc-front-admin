import { gql } from '@apollo/client';

// ============================================
// Authentication Mutations
// ============================================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
        status
        createdat
        updatedat
      }
    }
  }
`;

// ============================================
// Mail Setup Mutations
// ============================================

export const UPDATE_MAIL_SETUP = gql`
  mutation UpdateMailSetup($input: MailSetupInput!) {
    updateMailSetup(input: $input) {
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
// Customer Mutations
// ============================================

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CustomerMasterInput!) {
    createCustomer(input: $input) {
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
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: Int!, $input: CustomerMasterUpdateInput!) {
    updateCustomer(id: $id, input: $input) {
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
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: Int!) {
    deleteCustomer(id: $id)
  }
`;

// ============================================
// Customer Location Mutations
// ============================================

export const CREATE_CUSTOMER_LOCATION = gql`
  mutation CreateCustomerLocation($input: CustomerLocationInput!) {
    createCustomerLocation(input: $input) {
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
`;

export const UPDATE_CUSTOMER_LOCATION = gql`
  mutation UpdateCustomerLocation($id: Int!, $input: CustomerLocationUpdateInput!) {
    updateCustomerLocation(id: $id, input: $input) {
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
`;

export const DELETE_CUSTOMER_LOCATION = gql`
  mutation DeleteCustomerLocation($id: Int!) {
    deleteCustomerLocation(id: $id)
  }
`;

// ============================================
// Brand Mutations
// ============================================

export const CREATE_BRAND = gql`
  mutation CreateBrand($input: BrandInput!) {
    createBrand(input: $input) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: Int!, $input: BrandUpdateInput!) {
    updateBrand(id: $id, input: $input) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: Int!) {
    deleteBrand(id: $id)
  }
`;

// ============================================
// Category Mutations
// ============================================

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: Int!, $input: CategoryUpdateInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      details
      status
      createdat
      updatedat
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id)
  }
`;

// ============================================
// Product Mutations
// ============================================

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
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

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

// ============================================
// Invoice Mutations
// ============================================

export const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: InvoiceInput!) {
    createInvoice(input: $input) {
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
        productId
        serialNo
        quantity
        amount
        product {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: Int!, $input: InvoiceUpdateInput!) {
    updateInvoice(id: $id, input: $input) {
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
  }
`;

export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: Int!) {
    deleteInvoice(id: $id)
  }
`;

// ============================================
// Invoice Item Mutations
// ============================================

export const CREATE_INVOICE_ITEM = gql`
  mutation CreateInvoiceItem($invoiceId: Int!, $input: InvoiceItemInput!) {
    createInvoiceItem(invoiceId: $invoiceId, input: $input) {
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

export const UPDATE_INVOICE_ITEM = gql`
  mutation UpdateInvoiceItem($id: Int!, $input: InvoiceItemUpdateInput!) {
    updateInvoiceItem(id: $id, input: $input) {
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

export const DELETE_INVOICE_ITEM = gql`
  mutation DeleteInvoiceItem($id: Int!) {
    deleteInvoiceItem(id: $id)
  }
`;

// ============================================
// AMC Proposal Mutations
// ============================================

export const CREATE_AMC_PROPOSAL = gql`
  mutation CreateAmcProposal($input: AmcProposalInput!) {
    createAmcProposal(input: $input) {
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
  }
`;

export const UPDATE_AMC_PROPOSAL = gql`
  mutation UpdateAmcProposal($id: Int!, $input: AmcProposalUpdateInput!) {
    updateAmcProposal(id: $id, input: $input) {
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
  }
`;

export const DELETE_AMC_PROPOSAL = gql`
  mutation DeleteAmcProposal($id: Int!) {
    deleteAmcProposal(id: $id)
  }
`;

// ============================================
// Proposal Item Mutations
// ============================================

export const CREATE_PROPOSAL_ITEM = gql`
  mutation CreateProposalItem($proposalId: Int!, $input: ProposalItemInput!) {
    createProposalItem(proposalId: $proposalId, input: $input) {
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

export const UPDATE_PROPOSAL_ITEM = gql`
  mutation UpdateProposalItem($id: Int!, $input: ProposalItemUpdateInput!) {
    updateProposalItem(id: $id, input: $input) {
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

export const DELETE_PROPOSAL_ITEM = gql`
  mutation DeleteProposalItem($id: Int!) {
    deleteProposalItem(id: $id)
  }
`;

// ============================================
// Proposal Document Mutations
// ============================================

export const GENERATE_PROPOSAL_DOCUMENT = gql`
  mutation GenerateProposalDocument($proposalId: Int!) {
    generateProposalDocument(proposalId: $proposalId) {
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
// Email Record Mutations
// ============================================

export const SEND_PROPOSAL_EMAIL = gql`
  mutation SendProposalEmail($input: SendProposalEmailInput!) {
    sendProposalEmail(input: $input) {
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
