import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../main.dart';

class AdvancePage extends StatefulWidget {
  final ScrollController? scrollController;
  const AdvancePage({super.key, this.scrollController});

  @override
  State<AdvancePage> createState() => _AdvancePageState();
}

class _AdvancePageState extends State<AdvancePage> {
  final _amountCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  bool _submitting = false;
  bool _showSuccess = false;
  String _selectedType = 'advance';

  @override
  void dispose() {
    _amountCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amount = _amountCtrl.text.trim();
    final reason = _reasonCtrl.text.trim();
    if (amount.isEmpty || reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fill all fields'), backgroundColor: Color(0xFFba1a1a)),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ApiService.applyAdvance(amount, reason, type: _selectedType);
      setState(() => _showSuccess = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception:', '').trim()),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    } finally {
      setState(() => _submitting = false);
    }
  }

  void _resetForm() {
    _amountCtrl.clear();
    _reasonCtrl.clear();
    setState(() => _showSuccess = false);
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final colors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      body: SafeArea(child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Advance Request', style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w700, color: scheme.primary)),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 40, height: 40,
                    alignment: Alignment.center,
                    child: Icon(Icons.close, color: scheme.onSurfaceVariant),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              controller: widget.scrollController,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: colors.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: _showSuccess ? _buildSuccess(scheme, tt) : _buildFormContent(scheme, tt, colors),
                ),
              ],
            ),
          ),
        ],
      )),
    );
  }

  Widget _buildSuccess(ColorScheme scheme, TextTheme tt) {
    return Column(
      children: [
        Icon(Icons.check_circle, size: 48, color: const Color(0xFF1D7A4F)),
        const SizedBox(height: 8),
        Text('Request Submitted', style: tt.headlineSmall?.copyWith(color: const Color(0xFF0D5535))),
        const SizedBox(height: 4),
        Text('Your ${_selectedType == 'loan' ? 'loan' : 'advance'} request has been sent for approval.', style: tt.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: _resetForm,
          style: OutlinedButton.styleFrom(
            foregroundColor: scheme.primary,
            side: BorderSide(color: scheme.primary),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Request another'),
        ),
      ],
    );
  }

  Widget _buildFormContent(ColorScheme scheme, TextTheme tt, AppColors colors) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(tt, 'Type', colors),
        const SizedBox(height: 8),
        _typeDropdown(scheme, colors),
        const SizedBox(height: 16),
        _label(tt, 'Request Amount', colors),
        const SizedBox(height: 8),
        _amountField(scheme, colors),
        const SizedBox(height: 16),
        _label(tt, 'Reason', colors),
        const SizedBox(height: 8),
        _reasonField(scheme, colors),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: ElevatedButton(
            onPressed: _submitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: scheme.primary,
              foregroundColor: Colors.white,
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: _submitting
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text('Submit Request', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
          ),
        ),
      ],
    );
  }

  Widget _typeDropdown(ColorScheme scheme, AppColors colors) {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDDDDDD)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedType,
          isExpanded: true,
          icon: Icon(Icons.expand_more, color: scheme.onSurfaceVariant),
          style: TextStyle(fontSize: 14, color: scheme.onSurface),
          items: const [
            DropdownMenuItem(value: 'advance', child: Text('Advance (repay from salary)')),
            DropdownMenuItem(value: 'loan', child: Text('Loan (monthly deduction)')),
          ],
          onChanged: (v) {
            if (v != null) setState(() => _selectedType = v);
          },
        ),
      ),
    );
  }

  Widget _label(TextTheme tt, String text, AppColors colors) {
    return Text(text, style: tt.labelMedium?.copyWith(color: colors.outline));
  }

  Widget _amountField(ColorScheme scheme, AppColors colors) {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDDDDDD)),
      ),
      child: Row(
        children: [
          Text('₹ ', style: TextStyle(fontSize: 14, color: scheme.onSurface)),
          Expanded(
            child: TextField(
              controller: _amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: 'Enter amount',
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              style: TextStyle(fontSize: 14, color: scheme.onSurface),
            ),
          ),
        ],
      ),
    );
  }

  Widget _reasonField(ColorScheme scheme, AppColors colors) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDDDDDD)),
      ),
      child: TextField(
        controller: _reasonCtrl,
        maxLines: 4,
        decoration: InputDecoration(
          hintText: 'Explain why you need ${_selectedType == 'loan' ? 'a loan' : 'an advance'}',
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.zero,
        ),
        style: TextStyle(fontSize: 14, color: scheme.onSurface),
      ),
    );
  }
}
