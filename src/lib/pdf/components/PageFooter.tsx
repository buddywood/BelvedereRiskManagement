import { Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

const generatedDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

interface PageFooterProps {
  companyName?: string;
}

export function PageFooter({ companyName }: PageFooterProps) {
  const displayCompany = companyName || "AKILI Risk Intelligence";

  return (
    <View style={styles.footerContainer} fixed>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Confidential - Page ${pageNumber} of ${totalPages} | Generated ${generatedDate} | ${displayCompany}`
        }
      />
    </View>
  );
}
