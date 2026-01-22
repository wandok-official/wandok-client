interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

export const FeatureCard = ({ emoji, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};
