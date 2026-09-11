/* ============================================================================
 * AquaKit (Apple HIG Web UIKit) — React Component Adapters (index.js)
 * ============================================================================
 * COMMENTING STANDARDS
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React from 'react';

/* ============================================================================
 * 1. Inset Grouped Section & Card
 * ============================================================================ */
export function AppleGroup({ header, footer, children, className = '', style = {} }) {
    return React.createElement('div', { className: `apple-group-container ${className}`.trim(), style },
        header ? React.createElement('div', { className: 'apple-section-header' }, header) : null,
        children,
        footer ? React.createElement('div', { className: 'apple-section-footer' }, footer) : null
    );
}

export function AppleCard({ children, className = '', style = {} }) {
    return React.createElement('div', { className: `apple-card ${className}`.trim(), style }, children);
}

export function AppleRow({
    badge,
    label,
    sublabel,
    value,
    chevron = false,
    rightContent,
    onClick,
    href,
    className = '',
    style = {}
}) {
    const hasBadge = Boolean(badge);
    const rowClass = `apple-row ${hasBadge ? 'has-badge' : ''} ${className}`.trim();
    const tag = href ? 'a' : (onClick ? 'div' : 'div');
    const props = {
        className: rowClass,
        style: { ...style, cursor: onClick || href ? 'pointer' : 'default' },
        onClick
    };
    if (href) props.href = href;

    return React.createElement(tag, props,
        React.createElement('div', { className: 'apple-row-left' },
            badge || null,
            React.createElement('div', { className: 'apple-row-title-wrap' },
                React.createElement('span', { className: 'apple-row-label' }, label),
                sublabel ? React.createElement('span', { className: 'apple-row-sublabel' }, sublabel) : null
            )
        ),
        React.createElement('div', { className: 'apple-row-right' },
            value ? React.createElement('span', { className: 'apple-row-value' }, value) : null,
            rightContent || null,
            chevron ? React.createElement('svg', {
                className: 'apple-chevron',
                viewBox: '0 0 24 24'
            }, React.createElement('path', { d: 'M9 18l6-6-6-6' })) : null
        )
    );
}

/* ============================================================================
 * 2. iOS 18 Settings Badges
 * ============================================================================ */
export function AppleBadge({ color = 'blue', icon, className = '', style = {} }) {
    return React.createElement('div', {
        className: `apple-badge badge-${color} ${className}`.trim(),
        style
    }, icon);
}

/* ============================================================================
 * 3. Apple Stat & Metric Grid Cards
 * ============================================================================ */
export function AppleStatGrid({ children, className = '', style = {} }) {
    return React.createElement('div', { className: `apple-stat-grid ${className}`.trim(), style }, children);
}

export function AppleStatCard({ title, value, subtitle, className = '', style = {} }) {
    return React.createElement('div', { className: `apple-stat-card ${className}`.trim(), style },
        React.createElement('div', { className: 'apple-stat-title' }, title),
        React.createElement('div', { className: 'apple-stat-value' }, value),
        subtitle ? React.createElement('div', { className: 'apple-stat-subtitle' }, subtitle) : null
    );
}

/* ============================================================================
 * 4. Apple Segmented Control
 * ============================================================================ */
export function AppleSegmentedControl({ options = [], value, onChange, className = '', style = {} }) {
    return React.createElement('div', { className: `apple-segmented-control ${className}`.trim(), style },
        options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isActive = optVal === value;

            return React.createElement('button', {
                key: optVal,
                type: 'button',
                className: `apple-segment-btn ${isActive ? 'active' : ''}`.trim(),
                onClick: () => onChange && onChange(optVal)
            }, optLabel);
        })
    );
}

/* ============================================================================
 * 5. Apple Action Buttons
 * ============================================================================ */
export function AppleButton({
    children,
    variant = 'secondary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    style = {},
    icon = null
}) {
    const btnClass = `apple-btn apple-btn-${variant} apple-btn-${size} ${className}`.trim();
    return React.createElement('button', {
        type: 'button',
        className: btnClass,
        disabled,
        onClick,
        style
    }, icon ? React.createElement('span', { style: { display: 'inline-flex' } }, icon) : null, children);
}

/* ============================================================================
 * 6. Micro Status Pills
 * ============================================================================ */
export function AppleStatusPill({ status = 'success', children, className = '', style = {} }) {
    return React.createElement('div', {
        className: `apple-status-pill status-${status} ${className}`.trim(),
        style
    },
        React.createElement('span', { className: 'apple-status-dot' }),
        children
    );
}

/* ============================================================================
 * 7. iOS Native Toggle Switch
 * ============================================================================ */
export function AppleSwitch({ checked, onChange, disabled = false, className = '', style = {} }) {
    return React.createElement('label', { className: `apple-switch-wrap ${className}`.trim(), style },
        React.createElement('input', {
            type: 'checkbox',
            checked,
            disabled,
            onChange: (e) => onChange && onChange(e.target.checked)
        }),
        React.createElement('span', { className: 'apple-switch-slider' })
    );
}

/* ============================================================================
 * 8. Apple Health Cards & Responsive Grid
 * ============================================================================ */
export function AppleHealthGrid({ children, className = '', style = {} }) {
    return React.createElement('div', {
        className: `apple-health-grid ${className}`.trim(),
        style
    }, children);
}

export function AppleHealthCard({
    category = '',
    categoryColor = 'cyan',
    icon,
    time = '',
    statLabel = '',
    heroNumber = '',
    heroUnit = '',
    bars = [],
    chevron = true,
    onClick,
    className = '',
    style = {}
}) {
    return React.createElement('div', {
        className: `apple-health-card category-${categoryColor} ${className}`.trim(),
        onClick,
        style
    },
        React.createElement('div', { className: 'apple-health-header' },
            React.createElement('div', { className: 'apple-health-category' },
                icon ? React.createElement('span', { className: 'apple-health-icon' }, icon) : null,
                React.createElement('span', { className: 'apple-health-title' }, category)
            ),
            React.createElement('div', { className: 'apple-health-meta' },
                time ? React.createElement('span', null, time) : null,
                chevron ? React.createElement('svg', {
                    className: 'apple-health-chevron',
                    viewBox: '0 0 24 24'
                }, React.createElement('path', { d: 'M9 18l6-6-6-6' })) : null
            )
        ),
        React.createElement('div', { className: 'apple-health-body' },
            React.createElement('div', { className: 'apple-health-stat' },
                statLabel ? React.createElement('span', { className: 'apple-health-stat-label' }, statLabel) : null,
                React.createElement('div', { className: 'apple-health-hero' },
                    React.createElement('span', { className: 'apple-health-hero-number' }, heroNumber),
                    heroUnit ? React.createElement('span', { className: 'apple-health-hero-unit' }, heroUnit) : null
                )
            ),
            bars && bars.length > 0 ? React.createElement('div', { className: 'apple-health-chart' },
                bars.map((bar, idx) => React.createElement('div', {
                    key: idx,
                    className: `apple-health-bar ${bar.active ? 'is-active' : ''}`,
                    style: { height: `${bar.height || 24}px` }
                }))
            ) : null
        )
    );
}

export function AppleHealthBanner({
    tag = '',
    glyph,
    title,
    description,
    actionText,
    onAction,
    onClose,
    className = '',
    style = {}
}) {
    return React.createElement('div', {
        className: `apple-health-banner ${className}`.trim(),
        style
    },
        React.createElement('div', { className: 'apple-health-banner-top' },
            React.createElement('span', { className: 'apple-health-banner-tag' }, tag),
            onClose ? React.createElement('button', {
                type: 'button',
                className: 'apple-health-banner-close',
                onClick: onClose
            }, '✕') : null
        ),
        React.createElement('div', { className: 'apple-health-banner-content' },
            glyph ? React.createElement('div', { className: 'apple-health-banner-glyph' }, glyph) : null,
            React.createElement('div', { className: 'apple-health-banner-body' },
                React.createElement('div', { className: 'apple-health-banner-title' }, title),
                React.createElement('div', { className: 'apple-health-banner-desc' }, description),
                actionText ? React.createElement('a', {
                    className: 'apple-health-banner-action',
                    onClick: onAction,
                    href: '#',
                    role: 'button'
                }, actionText) : null
            )
        )
    );
}

/* ============================================================================
 * 9. Subpage Navigation Back Button
 * ============================================================================ */
export function AppleNavBackBtn({ label = '返回', onClick, className = '', style = {} }) {
    return React.createElement('button', {
        type: 'button',
        className: `apple-nav-back-btn ${className}`.trim(),
        onClick,
        style
    },
        React.createElement('svg', {
            className: 'apple-nav-back-chevron',
            viewBox: '0 0 24 24'
        }, React.createElement('path', { d: 'M15 18l-6-6 6-6' })),
        React.createElement('span', { className: 'apple-back-label' }, label)
    );
}

/* ============================================================================
 * 10. Apple Spinner & Skeleton Components
 * ============================================================================ */
export function AppleSpinner({ size = 'md', className = '', style = {} }) {
    const sizeClass = size === 'sm' ? 'apple-spinner-sm' : (size === 'lg' ? 'apple-spinner-lg' : '');
    return React.createElement('div', {
        className: `apple-spinner ${sizeClass} ${className}`.trim(),
        style
    }, Array.from({ length: 12 }).map((_, i) =>
        React.createElement('div', { key: i, className: 'apple-spinner-blade' })
    ));
}

export function AppleSkeleton({ variant = 'box', className = '', style = {} }) {
    const variantClass = `apple-skeleton-${variant}`;
    return React.createElement('div', {
        className: `apple-skeleton ${variantClass} ${className}`.trim(),
        style
    });
}

/* ============================================================================
 * 11. Apple Navigation Stack (SPA Push / Pop Container with Apple.mp4 Physics)
 * ============================================================================ */
export function AppleNavStack({
    activeSubpage,
    onBack,
    rootView,
    subpages = {},
    className = '',
    style = {}
}) {
    const [renderedSubpage, setRenderedSubpage] = React.useState(activeSubpage);
    const [phase, setPhase] = React.useState(activeSubpage ? 'settled' : 'root');
    /* phases: 'root' | 'pushing' | 'settled' | 'popping' */

    React.useEffect(() => {
        if (activeSubpage) {
            setRenderedSubpage(activeSubpage);
            setPhase('pushing');
            const timer = setTimeout(() => {
                setPhase('settled');
            }, 320);
            return () => clearTimeout(timer);
        } else if (renderedSubpage) {
            setPhase('popping');
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
            const timer = setTimeout(() => {
                setRenderedSubpage(null);
                setPhase('root');
            }, 280);
            return () => clearTimeout(timer);
        }
    }, [activeSubpage]);

    const containerRef = React.useRef(null);
    React.useEffect(() => {
        const el = containerRef.current;
        if (!el || !onBack) return;

        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        const onTouchStart = (e) => {
            if (e.touches.length !== 1 || !activeSubpage) return;
            if (e.touches[0].clientX > 32) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        };

        const onTouchMove = (e) => {
            if (!isSwiping) return;
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            if (deltaX <= 0) return;
            if (deltaY > deltaX && deltaX < 24) {
                isSwiping = false;
                return;
            }

            /* Prevent Safari native swipe navigation and overscroll gestures */
            if (e.cancelable) {
                e.preventDefault();
            }
        };

        const onTouchEnd = (e) => {
            if (!isSwiping) return;
            const deltaX = e.changedTouches[0].clientX - startX;
            isSwiping = false;
            if (deltaX > (window.innerWidth || 390) * 0.3) {
                onBack();
            }
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [activeSubpage, onBack]);

    const subpageNode = renderedSubpage ? subpages[renderedSubpage] : null;

    let containerStyle = {
        position: 'relative',
        width: '100%',
        overscrollBehaviorX: 'none',
        WebkitOverscrollBehaviorX: 'none',
        ...style
    };

    let rootViewStyle = {};
    let subpageStyle = {};

    if (phase === 'pushing') {
        containerStyle.overflow = 'hidden';
        containerStyle.minHeight = 'calc(100vh - 120px)';
        rootViewStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            pointerEvents: 'none'
        };
        subpageStyle = {
            position: 'relative',
            width: '100%',
            minHeight: '100%'
        };
    } else if (phase === 'settled') {
        containerStyle.overflow = 'visible';
        rootViewStyle = {
            display: 'none'
        };
        subpageStyle = {
            position: 'relative',
            width: '100%',
            transform: 'none',
            boxShadow: 'none',
            opacity: 1,
            pointerEvents: 'auto'
        };
    } else if (phase === 'popping') {
        containerStyle.overflow = 'hidden';
        containerStyle.minHeight = 'calc(100vh - 120px)';
        rootViewStyle = {
            position: 'relative',
            width: '100%',
            pointerEvents: 'none'
        };
        subpageStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
        };
    } else {
        containerStyle.overflow = 'visible';
        rootViewStyle = {
            position: 'relative',
            width: '100%'
        };
    }

    const isRootPushed = phase === 'pushing' || phase === 'settled';
    const isSubExiting = phase === 'popping';

    return React.createElement('div', {
        ref: containerRef,
        className: `apple-nav-stack apple-nav-stack-container ${phase === 'settled' ? 'is-settled' : ''} ${className}`.trim(),
        style: containerStyle
    },
        React.createElement('div', {
            className: `apple-nav-view ${isRootPushed ? 'is-pushed' : ''} ${phase === 'settled' ? 'is-hidden' : ''}`,
            style: rootViewStyle
        }, rootView),
        subpageNode ? React.createElement('div', {
            className: `apple-subpage ${!isSubExiting ? 'active' : 'is-exiting'} ${phase === 'settled' ? 'is-settled' : ''}`,
            style: subpageStyle
        }, subpageNode) : null
    );
}

export default {
    AppleGroup,
    AppleCard,
    AppleRow,
    AppleBadge,
    AppleStatGrid,
    AppleStatCard,
    AppleSegmentedControl,
    AppleButton,
    AppleStatusPill,
    AppleSwitch,
    AppleHealthGrid,
    AppleHealthCard,
    AppleHealthBanner,
    AppleNavBackBtn,
    AppleSpinner,
    AppleSkeleton,
    AppleNavStack
};
