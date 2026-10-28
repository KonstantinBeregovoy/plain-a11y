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
