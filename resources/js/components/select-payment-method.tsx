import React from 'react';

interface PaymentMethodSelectorProps {
    method: string;
    channel: string;
    onChange: (data: { method: string; channel: string }) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ method, channel, onChange }) => {
    const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMethod = e.target.value;
        onChange({ method: newMethod, channel: '' }); // reset channel saat method ganti
    };

    const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ method, channel: e.target.value });
    };

    const getChannels = () => {
        switch (method) {
            case 'manual_transfer':
                return ['BCA', 'BNI', 'MANDIRI', 'BRI'];
            case 'ewallet':
                return ['DANA', 'OVO', 'GOPAY', 'SHOPEEPAY'];
            case 'virtual_account':
                return ['BCA', 'BNI', 'MANDIRI', 'PERMATA'];
            case 'over_the_counter':
                return ['ALFAMART', 'INDOMARET'];
            default:
                return [];
        }
    };

    return (
        <div className="space-y-2">
            <label className="block">
                <span className="text-sm font-medium">Metode Pembayaran</span>
                <select className="input" value={method} onChange={handleMethodChange}>
                    <option value="manual_transfer">Manual Transfer</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="virtual_account">Virtual Account</option>
                    <option value="over_the_counter">Over The Counter</option>
                </select>
            </label>

            {getChannels().length > 0 && (
                <label className="block">
                    <span className="text-sm font-medium">Channel</span>
                    <select className="input" value={channel} onChange={handleChannelChange}>
                        <option value="">Pilih Channel</option>
                        {getChannels().map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
