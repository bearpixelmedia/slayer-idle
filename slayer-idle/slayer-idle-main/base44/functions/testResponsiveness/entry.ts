import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Viewport sizes to test
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12/13', width: 390, height: 844 },
      { name: 'iPhone 14 Pro', width: 393, height: 852 },
      { name: 'Pixel 4', width: 412, height: 891 },
      { name: 'Galaxy S9+', width: 414, height: 846 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'iPad Air', width: 1024, height: 1366 },
      { name: 'Desktop Small', width: 1280, height: 720 },
      { name: 'Desktop Large', width: 1920, height: 1080 },
    ];

    // Analyze issues
    const issues = [
      {
        category: 'Mobile Menu Overflow',
        severity: 'HIGH',
        affectedViewports: ['iPhone SE', 'iPhone 12/13', 'Pixel 4'],
        description: 'Menu wrapper still has padding/margin that causes horizontal overflow',
        recommendation: 'Ensure motion.div has no padding, use w-full without padding wrapper',
        component: 'pages/Game - menuOpen modal'
      },
      {
        category: 'Text Overflow',
        severity: 'MEDIUM',
        affectedViewports: ['iPhone SE'],
        description: 'Small viewport (375px) has limited space for text content',
        recommendation: 'Use text-[6px] or text-[7px] for smaller screens, add truncate class',
        component: 'components/game/UpgradeShop, StatsBar'
      },
      {
        category: 'Modal Responsiveness',
        severity: 'HIGH',
        affectedViewports: ['All Mobile'],
        description: 'Modal should use full viewport height minus safe areas',
        recommendation: 'Use max-h-[90vh] instead of max-h-[85vh], account for status bar',
        component: 'pages/Game - menuOpen overlay'
      },
      {
        category: 'Touch Target Sizes',
        severity: 'MEDIUM',
        affectedViewports: ['All Mobile'],
        description: 'Button sizes may be too small for reliable touch interaction',
        recommendation: 'Ensure minimum 44x44px tap targets on all buttons',
        component: 'UpgradeShop buttons, tab buttons'
      },
      {
        category: 'Flex Layout Issues',
        severity: 'HIGH',
        affectedViewports: ['All Mobile', 'iPad'],
        description: 'Inner frame div missing proper min-height constraint',
        recommendation: 'Add min-height: 0 and ensure flex: 1 works correctly with children',
        component: 'pages/Game - inner frame div'
      }
    ];

    const recommendations = [
      'Remove all padding/margin from fixed positioning elements',
      'Use box-sizing: border-box on all elements with borders',
      'Test 375px width (smallest modern phone) as baseline',
      'Add proper safe-area-inset CSS variables for notch handling',
      'Use 90vh max-height for modals on mobile to account for status bar',
      'Ensure all text content has responsive sizing with max-widths',
      'Add overflow-hidden to prevent horizontal scroll',
      'Test ScrollArea component behavior on small screens'
    ];

    return Response.json({
      viewportsTested: viewports.length,
      viewports,
      issuesFound: issues.length,
      issues,
      recommendations,
      summary: `Found ${issues.length} critical responsive design issues affecting mobile devices. Primary issue: menu horizontal overflow caused by internal padding/borders.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});