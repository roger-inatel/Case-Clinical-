/**
 * Camada de apresentação — API pública.
 *
 * Ordem de preferência ao precisar de um componente (design-system §2):
 *   1. shadcn/ui                — reexportado aqui;
 *   2. variante/token do tema   — em src/ui/shadcn/ e globals.css;
 *   3. componente de domínio    — só quando não existe equivalente.
 *
 * Nada em `src/domain/` ou `src/evaluation/` importa deste módulo.
 */

export { cn } from './cn';

/* ------------------------------------------------------------ shadcn/ui */
export { Alert, AlertDescription, AlertTitle } from './shadcn/alert';
export { Badge, badgeVariants } from './shadcn/badge';
export { Button, buttonVariants, type ButtonProps } from './shadcn/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './shadcn/card';
export { Checkbox } from './shadcn/checkbox';
export { Input } from './shadcn/input';
export { Label } from './shadcn/label';
export { RadioGroup, RadioGroupItem } from './shadcn/radio-group';
export { Separator } from './shadcn/separator';
export { Textarea } from './shadcn/textarea';

/* ---------------------------------------------------------- domínio/UX */
export { Breadcrumb } from './Breadcrumb';
export { Bullet } from './Bullet';
export { ButtonLink } from './ButtonLink';
export { CaseCard } from './CaseCard';
export { CommentaryBlock } from './CommentaryBlock';
export { DocumentBlock, DocumentLabel } from './DocumentBlock';
export { EmptyState } from './EmptyState';
export { PageHeader, SectionHeading } from './PageHeader';
export { OptionPill, OptionRadioRow, OptionRow, OptionToggle } from './SelectableOption';
export { StepIndicator } from './StepIndicator';
export { DIFFICULTY_LABEL, SPECIALTY_LABEL, VITAL_LABEL, specialtyLabel } from './labels';
