import { useLocalSearchParams, useRouter } from 'expo-router';
import ContactarAsesorScreen from "../../screens/ContactarAsesorScreen";

export default function ContactarAsesorPage() {
    const router = useRouter();
    const { fromTab } = useLocalSearchParams<{ fromTab?: string }>();

    return (
        <ContactarAsesorScreen
            onBack={() => router.replace({
                pathname: '/home',
                params: { openDrawer: 'true', activeTab: fromTab },
            })}
        />
    );
}
