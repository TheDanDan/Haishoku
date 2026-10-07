import {
  ThemeTogglerButton
} from '@/components/animate-ui/components/buttons/theme-toggler';

export function Header() {
    return (
        <header className="fixed top-0 left-0 w-full shadow-md z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Haishoku - Image Theme Converter</h1>
                <ThemeTogglerButton
                    variant={'outline'}
                    size={'sm'}
                    direction={'ltr'}
                    modes={['light', 'dark']}
                    />
            </div>
        </header>
    );
};