
import { 
  GameState, 
  Item, 
  Document, 
  Character, 
  Dialogue, 
  Task, 
  TaskStep, 
  Email, 
  Location 
} from './definitions';

// Items
export const ITEMS: Record<string, Item> = {
  ID_CARD: {
    id: 'id_card',
    name: 'Government ID Card',
    description: 'Your official identification card. Has your photo and personal details.',
    useText: 'You show your ID card.'
  },
  PASSPORT: {
    id: 'passport',
    name: 'Passport',
    description: 'Your international travel document. Expires in 2025.',
    useText: 'You present your passport.'
  },
  UTILITY_BILL: {
    id: 'utility_bill',
    name: 'Utility Bill',
    description: 'Recent electricity bill showing your address. Required for verification.',
    useText: 'You hand over the utility bill.'
  },
  BANK_STATEMENT: {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Printed bank statement from last month. Shows your account activity.',
    useText: 'You provide the bank statement.'
  },
  FORM_27B: {
    id: 'form_27b',
    name: 'Form 27-B',
    description: 'Official bureaucratic form. Must be completed in triplicate.',
    useText: 'You submit Form 27-B.'
  },
  STAPLER: {
    id: 'stapler',
    name: 'Office Stapler',
    description: 'Red swingline stapler. Very important for document processing.',
    useText: 'You staple the documents together.'
  },
  COFFEE: {
    id: 'coffee',
    name: 'Coffee',
    description: 'Hot coffee from the corner shop. Might help with the stress.',
    useText: 'You drink the coffee. Slightly calmer now.'
  },
  ANEURYSM_MEDS: {
    id: 'aneurysm_meds',
    name: 'Blood Pressure Medication',
    description: 'Prescribed medication to help manage stress-induced hypertension.',
    useText: 'You take your blood pressure medication. Feeling better.'
  }
};

// Documents
export const DOCUMENTS: Record<string, Document> = {
  RESIDENCY_FORM: {
    id: 'residency_form',
    name: 'Residency Verification Form',
    description: 'Official form to prove your current address for government records.',
    requiredFields: ['full_name', 'current_address', 'previous_address', 'date', 'signature'],
    filledFields: {},
    isComplete: false
  },
  BANK_AUTHORIZATION: {
    id: 'bank_authorization',
    name: 'Bank Account Authorization',
    description: 'Document required to access your bank account after address change.',
    requiredFields: ['account_holder_name', 'account_number', 'routing_number', 'new_address', 'date', 'signature'],
    filledFields: {},
    isComplete: false
  },
  MAIL_FORWARDING: {
    id: 'mail_forwarding',
    name: 'Mail Forwarding Request',
    description: 'Form to redirect your mail to your new address.',
    requiredFields: ['current_address', 'new_address', 'start_date', 'end_date', 'full_name', 'phone_number', 'signature'],
    filledFields: {},
    isComplete: false
  },
  EMPLOYMENT_VERIFICATION: {
    id: 'employment_verification',
    name: 'Employment Verification',
    description: 'Proof of employment required for various bureaucratic processes.',
    requiredFields: ['employee_name', 'employee_id', 'hire_date', 'current_position', 'salary', 'hr_contact', 'date', 'signature'],
    filledFields: {},
    isComplete: false
  }
};

// Characters
export const CHARACTERS: Record<string, Character> = {
  MRS_HENDERSON: {
    id: 'mrs_henderson',
    name: 'Mrs. Henderson',
    location: 'apartment',
    dialogue: [
      {
        id: 'intro',
        speaker: 'npc',
        text: 'Oh hello dear! I\'ve been trying to call you. The mailman dropped off another notice today - they\'re holding your packages at the post office again. You need three forms of identification to pick them up, and naturally, none of the forms they accept are the ones you have.'
      },
      {
        id: 'advice',
        speaker: 'npc',
        text: 'You should start at the post office, but fair warning - Mrs. Gunderson at the counter hasn\'t smiled since 1987. Take this coffee, you\'ll need it.',
        triggersTask: 'retrieve_mail'
      }
    ]
  },
  MRS_GUNDERSON: {
    id: 'mrs_gunderson',
    name: 'Mrs. Gunderson',
    location: 'postOffice',
    dialogue: [
      {
        id: 'greeting',
        speaker: 'npc',
        text: 'Next! What do you want? I don\'t have all day, and frankly, neither do you if you want to get through this before we close for inventory audit.'
      },
      {
        id: 'requirements',
        speaker: 'npc',
        text: 'Mail retrieval requires: Form 27-B completed in triplicate, two forms of government identification, proof of residency, and a notarized statement in triplicate explaining why you didn\'t pick up your mail last Tuesday between 2:15 and 2:20 PM.'
      },
      {
        id: 'forms',
        speaker: 'npc',
        text: 'The forms are on the counter. Fill them out. Correctly. No scribbles. No pen smudges. And for God\'s sake, use black ink. We don\'t accept blue.',
        requiredItems: ['form_27b']
      }
    ]
  },
  MR_PATEL: {
    id: 'mr_patel',
    name: 'Mr. Patel',
    location: 'bank',
    dialogue: [
      {
        id: 'greeting',
        speaker: 'npc',
        text: 'Welcome to First National. How can I help you today? Actually, let me stop you right there. I know why you\'re here. The address change form. Page 3, section 7b. It\'s always section 7b.'
      },
      {
        id: 'requirements',
        speaker: 'npc',
        text: 'For account access with address change, we need: completed Bank Authorization form, two forms of ID, proof of new address, employer verification, and you need to speak with Mr. Jenkins in commercial lending about your unused checking account privileges.'
      }
    ]
  },
  CLERK_JOHNSON: {
    id: 'clerk_johnson',
    name: 'Clerk Johnson',
    location: 'cityHall',
    dialogue: [
      {
        id: 'greeting',
        speaker: 'npc',
        text: 'Department of Records and Redundant Record-Keeping. Form 45-C or bust. You don\'t have Form 45-C, do you? Nobody ever has Form 45-C.'
      },
      {
        id: 'circle_file',
        speaker: 'npc',
        text: 'You\'re in the Circle File. That means you get to go to window 3, then window 7, then back to window 2, then window 5, and if you\'re lucky, window 1 again. Standard procedure.'
      }
    ]
  },
  LIBRARIAN: {
    id: 'librarian',
    name: 'Ms. Winters',
    location: 'library',
    dialogue: [
      {
        id: 'greeting',
        speaker: 'npc',
        text: 'Shhh. This is a place of quiet desperation and microfiche. How may I help you not make your day any worse?'
      },
      {
        id: 'help',
        speaker: 'npc',
        text: 'I might be able to help with some of your forms. We have a printer, and I know where they hide the extra copies of Form 27-B. Between you and me, always fill out section 12 in invisible ink. It confuses the optical scanners.',
        triggersTask: 'get_forms'
      }
    ]
  }
};

// Tasks
export const TASKS: Record<string, Task> = {
  RETRIEVE_MAIL: {
    id: 'retrieve_mail',
    title: 'Retrieve Lost Mail',
    description: 'Get your packages back from the post office before they send them to the Dead Letter Office.',
    location: 'postOffice',
    prerequisiteTasks: [],
    isComplete: false,
    steps: [
      {
        id: 'get_id',
        description: 'Obtain proper identification documents',
        isComplete: false,
        actionType: 'collect',
        target: 'id_card'
      },
      {
        id: 'get_form_27b',
        description: 'Find Form 27-B',
        isComplete: false,
        actionType: 'collect',
        target: 'form_27b'
      },
      {
        id: 'fill_form',
        description: 'Complete Form 27-B in triplicate',
        isComplete: false,
        actionType: 'fillForm',
        target: 'form_27b'
      },
      {
        id: 'submit_forms',
        description: 'Submit forms to post office',
        isComplete: false,
        actionType: 'talk',
        target: 'mrs_gunderson'
      }
    ]
  },
  ACCESS_BANK: {
    id: 'access_bank',
    title: 'Access Bank Account',
    description: 'Regain access to your bank account after the address change hold was placed.',
    location: 'bank',
    prerequisiteTasks: ['retrieve_mail'],
    isComplete: false,
    steps: [
      {
        id: 'get_bank_statement',
        description: 'Obtain recent bank statement',
        isComplete: false,
        actionType: 'collect',
        target: 'bank_statement'
      },
      {
        id: 'fill_bank_auth',
        description: 'Complete Bank Authorization form',
        isComplete: false,
        actionType: 'fillForm',
        target: 'bank_authorization'
      },
      {
        id: 'talk_to_mr_patel',
        description: 'Submit documents to bank representative',
        isComplete: false,
        actionType: 'talk',
        target: 'mr_patel'
      }
    ]
  },
  CLEAR_CIRCLE_FILE: {
    id: 'clear_circle_file',
    title: 'Escape the Circle File',
    description: 'Navigate the bureaucratic circle file system at City Hall to clear your records.',
    location: 'cityHall',
    prerequisiteTasks: ['access_bank'],
    isComplete: false,
    steps: [
      {
        id: 'visit_windows',
        description: 'Visit required windows in correct order',
        isComplete: false,
        actionType: 'solvePuzzle',
        target: 'circle_file_puzzle'
      },
      {
        id: 'get_stamped_forms',
        description: 'Get all forms properly stamped and initialed',
        isComplete: false,
        actionType: 'collect',
        target: 'stamped_documents'
      }
    ]
  },
  GET_FORMS: {
    id: 'get_forms',
    title: 'Get Missing Forms',
    description: 'Find the bureaucratic forms you need at the library.',
    location: 'library',
    prerequisiteTasks: [],
    isComplete: false,
    steps: [
      {
        id: 'talk_to_librarian',
        description: 'Ask librarian for help with forms',
        isComplete: false,
        actionType: 'talk',
        target: 'librarian'
      },
      {
        id: 'print_forms',
        description: 'Print necessary forms from library computer',
        isComplete: false,
        actionType: 'print',
        target: 'forms'
      }
    ]
  }
};

// Initial emails
export const INITIAL_EMAILS: Email[] = [
  {
    id: 'bank_notice',
    from: 'Customer Service <noreply@firstnational.com>',
    to: 'Player <player@example.com>',
    subject: 'Important: Address Change Verification Required',
    body: 'Dear Valued Customer,\n\nWe have received a request to change the address on your account. For security purposes, we require additional verification before this change can be processed.\n\nPlease visit your local branch with:\n- Government-issued photo ID\n- Proof of new address (utility bill, lease agreement)\n- Employment verification form\n- Completed Bank Authorization (Form FN-BA-2024)\n- Notarized affidavit explaining reason for address change\n\nYour account will remain on hold until all documentation is received and verified.\n\nRegards,\nFirst National Bank Security Department',
    isRead: false,
    sentTime: 850
  },
  {
    id: 'post_office_notice',
    from: 'USPS <delivery@usps.gov>',
    to: 'Player <player@example.com>',
    subject: 'Package Hold Notice - Action Required',
    body: 'ATTENTION: Your packages cannot be delivered due to address verification issues.\n\nPackages currently held:\n- 1 medium priority mail package\n- 1 express mail package\n- 2 periodicals\n\nTo retrieve your mail, you must personally visit your local post office with:\n- Completed Form 27-B (in triplicate)\n- Two forms of government identification\n- Proof of current residency\n- Notarized statement explaining absence on Tuesday 2:15-2:20 PM\n\nFailure to retrieve packages within 7 business days may result in return to sender.\n\nSincerely,\nUnited States Postal Service\nBureaucracy Division',
    isRead: false,
    sentTime: 845
  },
  {
    id: 'employment_hr',
    from: 'HR Department <hr@techcorp.com>',
    to: 'Player <player@example.com>',
    subject: 'Address Change Documentation Required',
    body: 'Hello,\n\nOur records show you recently changed your address. Please provide updated employment verification for your personnel file.\n\nRequired documents:\n- Updated W-4 form\n- Proof of new address\n- New emergency contact information\n- Completed Employment Verification form\n\nThis must be completed within 5 business days for payroll processing.\n\nThanks,\nHR Department\nTechCorp Industries',
    isRead: false,
    sentTime: 830
  }
];

// Character locations by game state
export function getCharacterAtLocation(location: Location, gameState: GameState): Character | null {
  const characters = Object.values(CHARACTERS).filter(c => c.location === location);
  return characters.length > 0 ? characters[0] : null;
}

// Items available at locations
export const LOCATION_ITEMS: Record<Location, Item[]> = {
  apartment: [ITEMS.COFFEE],
  postOffice: [ITEMS.FORM_27B],
  bank: [],
  cityHall: [],
  library: [],
  coffeeShop: [ITEMS.COFFEE],
  dmv: [],
  workplace: []
};
