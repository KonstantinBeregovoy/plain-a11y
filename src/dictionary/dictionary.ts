export type Role = 'design' | 'content' | 'code';

export interface DictionaryEntry {
  id: string;
  title: string;
  whoIsAffected: string;
  howToFix: string;
  role: Role;
}

/** Rule description for the popup. Rules outside the dictionary may have no texts. */
export interface RuleDescription {
  id: string;
  title: string;
  whoIsAffected: string | null;
  howToFix: string | null;
  role: Role;
}

export const dictionary: readonly DictionaryEntry[] = [
  {
    id: 'color-contrast',
    title: 'Text is hard to read against its background',
    whoIsAffected:
      'People with low vision, and anyone reading a screen in bright light.',
    howToFix:
      'Make the text darker or the background lighter until the text is easy to read. Check the color pair with any contrast checker.',
    role: 'design',
  },
  {
    id: 'image-alt',
    title: 'Image has no text description',
    whoIsAffected:
      'Blind people: a screen reader cannot tell them what the image shows.',
    howToFix:
      'Add a short description that conveys what the image means. If the image is purely decorative, mark it as decorative.',
    role: 'content',
  },
  {
    id: 'label',
    title: 'Form field has no label',
    whoIsAffected:
      'Blind people and people who use voice control or a keyboard: they cannot tell what to enter.',
    howToFix:
      'Attach a visible label to the field instead of relying on placeholder text alone. The label should stay in place while someone types.',
    role: 'code',
  },
  {
    id: 'link-name',
    title: 'Link has no meaningful text',
    whoIsAffected:
      'Blind people: a screen reader will just say “link” with no hint where it goes.',
    howToFix:
      'Write link text that says where the link leads. Avoid bare “click here” or “read more”.',
    role: 'content',
  },
  {
    id: 'button-name',
    title: 'Button has no name',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the button does.',
    howToFix:
      'Give the button a text label, or a hidden name if it only shows an icon. The name should describe the action, for example “Close”.',
    role: 'code',
  },
  {
    id: 'heading-order',
    title: 'Headings skip levels',
    whoIsAffected:
      'Blind people and anyone who jumps around a page using its headings.',
    howToFix:
      'Arrange headings in levels without gaps: a second level follows the first, a third follows the second. Choose the level by meaning, not by font size.',
    role: 'content',
  },
  {
    id: 'document-title',
    title: 'Page has no title',
    whoIsAffected:
      'Anyone with many tabs open, and blind people, whose screen reader reads the title first.',
    howToFix:
      'Give the page a short title that sets it apart from other pages on the site. Put the main topic first and the site name last.',
    role: 'content',
  },
  {
    id: 'html-has-lang',
    title: 'Page language is not set',
    whoIsAffected:
      'Blind people: a screen reader may read the text with the wrong pronunciation.',
    howToFix:
      'Ask developers to set the page language, for example English. It is done once for the whole site.',
    role: 'code',
  },
  {
    id: 'frame-title',
    title: 'Embedded frame has no title',
    whoIsAffected:
      'Blind people: they cannot tell what an embedded frame, such as a map or a video, contains.',
    howToFix:
      'Give the frame a short title that describes its content, for example “Directions map”.',
    role: 'code',
  },
  {
    id: 'target-size',
    title: 'Clickable area is too small',
    whoIsAffected:
      'People with hand tremors or limited dexterity, and anyone tapping on a small screen.',
    howToFix:
      'Make buttons and links at least 24 by 24 pixels, or leave enough space around the small ones. Bigger targets are easier to hit.',
    role: 'design',
  },
  {
    id: 'tabindex',
    title: 'Tab order has been changed',
    whoIsAffected:
      'People who work without a mouse: focus jumps around the page in an unexpected order.',
    howToFix:
      'Ask developers to remove the extra tab-order settings and keep the natural order of elements. Focus then moves top to bottom, the way the page reads.',
    role: 'code',
  },
  {
    id: 'aria-allowed-attr',
    title: 'Element uses an accessibility setting it does not support',
    whoIsAffected:
      'Blind people and other screen reader users: the page may announce wrong or confusing information.',
    howToFix:
      'Ask developers to remove the unsupported accessibility attributes from this element, or to use an element that supports them.',
    role: 'code',
  },
  {
    id: 'aria-allowed-role',
    title: 'Element has a role that does not fit it',
    whoIsAffected:
      'Screen reader users, who may hear the element described as something it is not.',
    howToFix:
      'Ask developers to use the plain HTML element for the job, such as a real button or list, instead of overriding its role.',
    role: 'code',
  },
  {
    id: 'aria-braille-equivalent',
    title: 'Braille-only label has no plain-text version',
    whoIsAffected:
      'Blind people whose software ignores the braille label, and anyone who needs the regular text.',
    howToFix:
      'Ask developers to add the regular text label next to the braille-specific one.',
    role: 'code',
  },
  {
    id: 'aria-command-name',
    title: 'Custom button or link has no name',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the control does.',
    howToFix:
      'Give the control a text label that describes the action, for example “Open menu”. If it only shows an icon, add a hidden text name.',
    role: 'code',
  },
  {
    id: 'aria-conditional-attr',
    title: 'Accessibility setting is used in the wrong way for this element',
    whoIsAffected:
      'Screen reader users, who may get misleading information about the state of the element.',
    howToFix:
      'Ask developers to review this element: the attribute is allowed on it, but not in the way it is used here.',
    role: 'code',
  },
  {
    id: 'aria-deprecated-role',
    title: 'Element uses an outdated role',
    whoIsAffected:
      'Screen reader users: newer software may ignore the role and describe the element wrongly.',
    howToFix:
      'Ask developers to replace the outdated role with a current one, or with the matching plain HTML element.',
    role: 'code',
  },
  {
    id: 'aria-dialog-name',
    title: 'Dialog window has no name',
    whoIsAffected:
      'Blind people: when the dialog opens, the screen reader cannot say what it is about.',
    howToFix:
      'Give the dialog a short title, ideally the same text as its visible heading.',
    role: 'code',
  },
  {
    id: 'aria-hidden-body',
    title: 'The whole page is hidden from screen readers',
    whoIsAffected:
      'Blind people: a screen reader finds an empty page.',
    howToFix:
      'Ask developers to remove the setting that hides the page body. It is often left behind by a pop-up or a script.',
    role: 'code',
  },
  {
    id: 'aria-input-field-name',
    title: 'Custom input field has no name',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what to enter.',
    howToFix:
      'Attach a visible label to the field, or give it a text name. The label should say what is expected, for example “Search”.',
    role: 'code',
  },
  {
    id: 'aria-meter-name',
    title: 'Gauge has no name',
    whoIsAffected:
      'Blind people: they hear a value without knowing what it measures.',
    howToFix:
      'Give the gauge a short text name, such as “Battery level”.',
    role: 'code',
  },
  {
    id: 'aria-progressbar-name',
    title: 'Progress bar has no name',
    whoIsAffected:
      'Blind people: they hear a percentage without knowing what is loading.',
    howToFix:
      'Give the progress bar a short text name, such as “Upload progress”.',
    role: 'code',
  },
  {
    id: 'aria-prohibited-attr',
    title: 'Element uses an accessibility setting that is not allowed on it',
    whoIsAffected:
      'Screen reader users: the setting is ignored or announced in a confusing way.',
    howToFix:
      'Ask developers to remove the attribute from this element, or to move it to an element where it is allowed.',
    role: 'code',
  },
  {
    id: 'aria-required-attr',
    title: 'Custom control is missing information it needs',
    whoIsAffected:
      'Screen reader users: they cannot tell the state of the control, such as whether it is checked or expanded.',
    howToFix:
      'Ask developers to add the missing attributes the control needs, or to switch to a standard HTML control that includes them.',
    role: 'code',
  },
  {
    id: 'aria-required-children',
    title: 'Custom list, menu or table is missing required parts',
    whoIsAffected:
      'Screen reader users: the structure is announced wrongly or not at all.',
    howToFix:
      'Ask developers to put the required items inside it, for example menu items inside a menu. Standard HTML lists and tables do this automatically.',
    role: 'code',
  },
  {
    id: 'aria-required-parent',
    title: 'Item is not inside the container it belongs to',
    whoIsAffected:
      'Screen reader users: the item is announced without its context.',
    howToFix:
      'Ask developers to place the item inside the right container, for example a tab inside a tab list.',
    role: 'code',
  },
  {
    id: 'aria-roles',
    title: 'Element has an invalid role',
    whoIsAffected:
      'Screen reader users: the element may be ignored or described wrongly.',
    howToFix:
      'Ask developers to correct the role name, or to remove it and use the matching plain HTML element.',
    role: 'code',
  },
  {
    id: 'aria-tab-name',
    title: 'Tab has no name',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the tab opens.',
    howToFix:
      'Give each tab a short text label that says what it shows, such as “Reviews”.',
    role: 'code',
  },
  {
    id: 'aria-text',
    title: 'Text wrapper contains clickable parts',
    whoIsAffected:
      'Screen reader users: the links and buttons inside may be unreachable.',
    howToFix:
      'Ask developers to remove the text role from this element, or to take the links and buttons out of it.',
    role: 'code',
  },
  {
    id: 'aria-toggle-field-name',
    title: 'Custom checkbox or switch has no name',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the switch turns on or off.',
    howToFix:
      'Attach a visible label that says what the option does, for example “Receive emails”.',
    role: 'code',
  },
  {
    id: 'aria-tooltip-name',
    title: 'Tooltip has no text',
    whoIsAffected:
      'Blind people: the tooltip is announced without any content.',
    howToFix:
      'Make sure the tooltip contains its message as real text, and that it is linked to the element it describes.',
    role: 'code',
  },
  {
    id: 'aria-treeitem-name',
    title: 'Tree item has no name',
    whoIsAffected:
      'Blind people: they cannot tell which item of the tree they are on.',
    howToFix:
      'Give every item in the tree a short text label.',
    role: 'code',
  },
  {
    id: 'aria-valid-attr-value',
    title: 'Accessibility setting has an invalid value',
    whoIsAffected:
      'Screen reader users: the setting is ignored, so the element may be described wrongly.',
    howToFix:
      'Ask developers to correct the value, for example a reference to an element that does not exist on the page.',
    role: 'code',
  },
  {
    id: 'aria-valid-attr',
    title: 'Accessibility setting name is misspelled or does not exist',
    whoIsAffected:
      'Screen reader users: the setting is ignored.',
    howToFix:
      'Ask developers to fix the attribute name, which is often a typo, or to remove it.',
    role: 'code',
  },
  {
    id: 'presentation-role-conflict',
    title: 'Element is marked as decoration but is still used',
    whoIsAffected:
      'Screen reader users: the element is hidden in some cases and read in others.',
    howToFix:
      'Ask developers to remove the decorative role from elements that can be focused or have a label, or to remove the focus or label.',
    role: 'code',
  },
  {
    id: 'label-content-name-mismatch',
    title: 'Button or link is named differently from what it shows',
    whoIsAffected:
      'Voice-control users, who say the words they see on the screen and get no response.',
    howToFix:
      'Make the hidden name include the exact visible text. For example, a button that shows “Search” should not be named “Find”.',
    role: 'code',
  },
  {
    id: 'landmark-banner-is-top-level',
    title: 'Page header area is nested inside another area',
    whoIsAffected:
      'Screen reader users, who jump between page areas and may not find the header.',
    howToFix:
      'Ask developers to move the page header out of other page areas, so that it sits directly in the page.',
    role: 'code',
  },
  {
    id: 'landmark-contentinfo-is-top-level',
    title: 'Page footer area is nested inside another area',
    whoIsAffected:
      'Screen reader users, who jump between page areas and may not find the footer.',
    howToFix:
      'Ask developers to move the page footer out of other page areas, so that it sits directly in the page.',
    role: 'code',
  },
  {
    id: 'landmark-main-is-top-level',
    title: 'Main content area is nested inside another area',
    whoIsAffected:
      'Screen reader users, who jump straight to the main content and may miss it.',
    howToFix:
      'Ask developers to move the main content area out of other page areas, so that it sits directly in the page.',
    role: 'code',
  },
  {
    id: 'landmark-no-duplicate-banner',
    title: 'Page has more than one header area',
    whoIsAffected:
      'Screen reader users, who cannot tell which header belongs to the whole page.',
    howToFix:
      'Ask developers to keep one page header and to mark any other headers as ordinary sections.',
    role: 'code',
  },
  {
    id: 'landmark-no-duplicate-contentinfo',
    title: 'Page has more than one footer area',
    whoIsAffected:
      'Screen reader users, who cannot tell which footer belongs to the whole page.',
    howToFix:
      'Ask developers to keep one page footer and to mark any other footers as ordinary sections.',
    role: 'code',
  },
  {
    id: 'landmark-no-duplicate-main',
    title: 'Page has more than one main content area',
    whoIsAffected:
      'Screen reader users, who cannot tell where the real main content is.',
    howToFix:
      'Ask developers to keep exactly one main content area on the page.',
    role: 'code',
  },
  {
    id: 'landmark-one-main',
    title: 'Page has no main content area',
    whoIsAffected:
      'Screen reader users, who cannot jump straight to the main content.',
    howToFix:
      'Ask developers to wrap the main content of the page in one main content area.',
    role: 'code',
  },
  {
    id: 'landmark-unique',
    title: 'Several page areas of the same kind look identical',
    whoIsAffected:
      'Screen reader users, who hear the same name for different areas.',
    howToFix:
      'Give each of them a short, different name, for example “Main menu” and “Footer menu”.',
    role: 'code',
  },
  {
    id: 'page-has-heading-one',
    title: 'Page has no main heading',
    whoIsAffected:
      'Screen reader users and anyone scanning the page: the main heading says what the page is about.',
    howToFix:
      'Add one top-level heading that names the page, and place it at the start of the main content.',
    role: 'content',
  },
  {
    id: 'accesskeys',
    title: 'Two shortcut keys are the same',
    whoIsAffected:
      'Keyboard users: one shortcut key opens the wrong thing or does nothing.',
    howToFix:
      'Ask developers to give every shortcut key a different letter, or to remove the duplicates.',
    role: 'code',
  },
  {
    id: 'bypass',
    title: 'No way to skip repeated blocks',
    whoIsAffected:
      'Keyboard and screen reader users, who must move through the menu again on every page.',
    howToFix:
      'Ask developers to add a “Skip to main content” link at the top, or to mark the page areas so that users can jump between them.',
    role: 'code',
  },
  {
    id: 'frame-focusable-content',
    title: 'Embedded frame with clickable parts cannot be reached by keyboard',
    whoIsAffected:
      'Keyboard users: they cannot get into the frame.',
    howToFix:
      'Ask developers to remove the setting that takes the frame out of the keyboard order.',
    role: 'code',
  },
  {
    id: 'nested-interactive',
    title: 'Clickable element is placed inside another clickable element',
    whoIsAffected:
      'Screen reader and voice-control users: the inner control may be ignored or announced wrongly.',
    howToFix:
      'Ask developers to separate them, for example a button inside a link should become two side-by-side controls.',
    role: 'code',
  },
  {
    id: 'region',
    title: 'Some content is outside any page area',
    whoIsAffected:
      'Screen reader users, who jump between areas and skip content that belongs to none.',
    howToFix:
      'Ask developers to place all content inside page areas such as header, main, navigation and footer.',
    role: 'code',
  },
  {
    id: 'scrollable-region-focusable',
    title: 'Scrollable area cannot be reached with the keyboard',
    whoIsAffected:
      'Keyboard users: they cannot scroll to see the hidden content.',
    howToFix:
      'Ask developers to make the scrollable area focusable, or to make sure it contains something that can be focused.',
    role: 'code',
  },
  {
    id: 'skip-link',
    title: 'Skip link points to nothing usable',
    whoIsAffected:
      'Keyboard users: the link meant to jump past the menu does not work.',
    howToFix:
      'Ask developers to make the skip link lead to an element that exists and can receive focus, such as the main content.',
    role: 'code',
  },
  {
    id: 'avoid-inline-spacing',
    title: 'Text spacing is locked and cannot be adjusted',
    whoIsAffected:
      'People with dyslexia or low vision, who widen text spacing to read comfortably.',
    howToFix:
      'Ask developers to remove the forced spacing from the text, so that the reader’s own style settings can override it.',
    role: 'code',
  },
  {
    id: 'definition-list',
    title: 'Definition list is built incorrectly',
    whoIsAffected:
      'Screen reader users: the list is read as a jumble instead of term and meaning pairs.',
    howToFix:
      'Ask developers to put only term and description pairs directly inside the definition list.',
    role: 'code',
  },
  {
    id: 'dlitem',
    title: 'Term or description is outside a definition list',
    whoIsAffected:
      'Screen reader users: the term is read without its list context.',
    howToFix:
      'Ask developers to wrap the term and description in a definition list, or to use another element.',
    role: 'code',
  },
  {
    id: 'frame-tested',
    title: 'Content of an embedded frame was not checked',
    whoIsAffected:
      'Everyone who relies on that content: problems inside the frame stay unseen.',
    howToFix:
      'Check the framed page separately, or ask developers to let the check run inside the frame.',
    role: 'code',
  },
  {
    id: 'list',
    title: 'List is built incorrectly',
    whoIsAffected:
      'Screen reader users: the list is announced with wrong or missing item counts.',
    howToFix:
      'Ask developers to put only list items directly inside the list. If a text editor created it, remove the stray elements between the items.',
    role: 'code',
  },
  {
    id: 'listitem',
    title: 'List item is outside a list',
    whoIsAffected:
      'Screen reader users: the item is read without its list context.',
    howToFix:
      'Ask developers to wrap the item in a list, or to use another element.',
    role: 'code',
  },
  {
    id: 'area-alt',
    title: 'Clickable part of an image has no text description',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the clickable part does.',
    howToFix:
      'Add a short description to each clickable part of the image that says where it leads.',
    role: 'content',
  },
  {
    id: 'frame-title-unique',
    title: 'Two embedded frames have the same title',
    whoIsAffected:
      'Blind people: they cannot tell the frames apart.',
    howToFix:
      'Give each embedded frame its own short title that describes its content.',
    role: 'code',
  },
  {
    id: 'image-redundant-alt',
    title: 'Image description repeats the text next to it',
    whoIsAffected:
      'Screen reader users, who hear the same words twice.',
    howToFix:
      'Shorten or remove the image description if it only repeats the text beside it. Keep it only when it adds something new.',
    role: 'content',
  },
  {
    id: 'input-image-alt',
    title: 'Image button has no text description',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the button does.',
    howToFix:
      'Add a short description that names the action, for example “Search”, not what the picture looks like.',
    role: 'content',
  },
  {
    id: 'object-alt',
    title: 'Embedded object has no text alternative',
    whoIsAffected:
      'Blind people: they cannot tell what the embedded content is.',
    howToFix:
      'Add a short text description of the embedded content, or provide the same information as ordinary text.',
    role: 'content',
  },
  {
    id: 'role-img-alt',
    title: 'Custom image has no text description',
    whoIsAffected:
      'Blind people: a screen reader cannot tell them what the image shows.',
    howToFix:
      'Add a short description that conveys what the image means. If it is purely decorative, mark it as decorative.',
    role: 'content',
  },
  {
    id: 'server-side-image-map',
    title: 'Clickable picture works only with a mouse',
    whoIsAffected:
      'Keyboard users, who cannot choose the parts of the picture.',
    howToFix:
      'Ask developers to replace it with ordinary links, or with a picture whose parts can be reached by keyboard.',
    role: 'code',
  },
  {
    id: 'svg-img-alt',
    title: 'Vector graphic has no text description',
    whoIsAffected:
      'Blind people: a screen reader cannot tell them what the graphic shows.',
    howToFix:
      'Add a short title or description to the graphic that conveys its meaning. If it is only decoration, mark it as decorative.',
    role: 'content',
  },
  {
    id: 'video-caption',
    title: 'Video has no captions',
    whoIsAffected:
      'Deaf and hard-of-hearing people, and anyone watching without sound.',
    howToFix:
      'Add captions that include speech and important sounds. Most video platforms can add them to the file.',
    role: 'content',
  },
  {
    id: 'aria-hidden-focus',
    title: 'Hidden content can still be reached by keyboard',
    whoIsAffected:
      'Keyboard and screen reader users: focus lands on something they cannot see or hear.',
    howToFix:
      'Ask developers to either show the content to everyone, or to make it unreachable by keyboard while it is hidden.',
    role: 'code',
  },
  {
    id: 'empty-heading',
    title: 'Heading has no text',
    whoIsAffected:
      'Screen reader users, who hear an empty heading and cannot tell what follows.',
    howToFix:
      'Add text to the heading, or remove it if it is only used for spacing.',
    role: 'content',
  },
  {
    id: 'empty-table-header',
    title: 'Table header cell is empty',
    whoIsAffected:
      'Screen reader users: they cannot tell what the column or row contains.',
    howToFix:
      'Write a short label in each header cell, or turn the cell into an ordinary one if it needs no label.',
    role: 'content',
  },
  {
    id: 'input-button-name',
    title: 'Button created from an input has no text',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the button does.',
    howToFix:
      'Give the button a text value that describes the action, for example “Send”.',
    role: 'code',
  },
  {
    id: 'summary-name',
    title: 'Expandable section has no title',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what the section contains.',
    howToFix:
      'Add a short title to the expandable section that says what it opens.',
    role: 'code',
  },
  {
    id: 'autocomplete-valid',
    title: 'Form field is set to fill in the wrong kind of data',
    whoIsAffected:
      'People with memory or motor difficulties, who rely on the browser to fill in forms.',
    howToFix:
      'Ask developers to use a valid autofill value that matches the field, for example “email” for an email address.',
    role: 'code',
  },
  {
    id: 'form-field-multiple-labels',
    title: 'Form field has several labels',
    whoIsAffected:
      'Screen reader users, who may hear only one of the labels or a confusing mix.',
    howToFix:
      'Ask developers to keep one label per field.',
    role: 'code',
  },
  {
    id: 'label-title-only',
    title: 'Form field has no visible label',
    whoIsAffected:
      'Everyone, especially people with memory or attention difficulties: a hint that disappears is easy to lose.',
    howToFix:
      'Add a visible label next to the field. Do not rely on a tooltip or a placeholder alone.',
    role: 'design',
  },
  {
    id: 'select-name',
    title: 'Dropdown has no label',
    whoIsAffected:
      'Blind people and voice-control users: they cannot tell what to choose.',
    howToFix:
      'Attach a visible label to the dropdown that says what the choice is for, for example “Country”.',
    role: 'code',
  },
];

const byId = new Map(dictionary.map((entry) => [entry.id, entry]));

/**
 * Returns a plain-language description of a rule. If the rule is not in the
 * dictionary, it falls back to the axe help text and hands the task to `code`.
 */
export function describeRule(id: string, axeHelp: string): RuleDescription {
  const entry = byId.get(id);
  if (entry) return entry;
  return {
    id,
    title: axeHelp,
    whoIsAffected: null,
    howToFix: null,
    role: 'code',
  };
}
