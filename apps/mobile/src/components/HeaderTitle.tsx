import { PlatformColor, StyleSheet, Text } from 'react-native'

// iOS native-stack ignores headerTitleAlign for plain string titles and always
// centers them; rendering the title as a full-width, left-aligned custom
// headerTitle component is the only reliable way to left-align it.
const HeaderTitle = ({ title }: { title: string }) => (
  <Text style={styles.title} numberOfLines={1}>
    {title}
  </Text>
)

export default HeaderTitle

const styles = StyleSheet.create({
  title: {
    width: '100%',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: PlatformColor('label'),
  },
})
