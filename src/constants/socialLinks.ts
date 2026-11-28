/**
 * Public social profiles shown in the site header and footer.
 *
 * A link only renders when its `href` is set, so the site never shows icons
 * that go nowhere. Fill in the real profile URLs to bring them back.
 */
export type SocialNetwork = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';

export interface SocialLink {
    network: SocialNetwork;
    /** Accessible name, e.g. "AMMC Builders Liability on Facebook". */
    label: string;
    href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
    { network: 'facebook', label: 'Builders Liability on Facebook', href: '' },
    { network: 'instagram', label: 'Builders Liability on Instagram', href: '' },
    { network: 'twitter', label: 'Builders Liability on X (Twitter)', href: '' },
    { network: 'linkedin', label: 'Builders Liability on LinkedIn', href: '' },
    { network: 'youtube', label: 'Builders Liability on YouTube', href: '' },
];

export const activeSocialLinks = (): SocialLink[] => SOCIAL_LINKS.filter((link) => link.href.trim() !== '');
