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
    id: 'tabindex',
    title: 'Tab order has been changed',
    whoIsAffected:
      'People who work without a mouse: focus jumps around the page in an unexpected order.',
    howToFix:
      'Ask developers to remove the extra tab-order settings and keep the natural order of elements. Focus then moves top to bottom, the way the page reads.',
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
