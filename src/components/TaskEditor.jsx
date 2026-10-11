import { Button, Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;

export default function TaskEditor({ open, task, onCancel, onSave }) {
    const [form] = Form.useForm();
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        form.setFieldsValue(task ? {
            title: task.title,
            description: task.description,
            priority: task.priority,
            forWhen: task.forWhen,
        } : { title: '', description: '', priority: undefined, forWhen: undefined });
    }, [form, open, task]);

    async function submit(values) {
        setBusy(true);
        try {
            await onSave(values);
            form.resetFields();
        } catch {
            return;
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal
            open={open}
            title={<div><span className="text-[10px] font-bold tracking-[1px] text-[#89968d] dark:text-[#9eaaa1]">TASK DETAILS</span><h2 className="mb-0 mt-[5px] font-display text-[23px] font-normal text-[#2c3b31] dark:text-[#e0e7e1]">{task ? 'Shape the task' : 'Make a plan'}</h2></div>}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            className="task-editor-modal"
            width={520}
        >
            <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} className="[&_.ant-form-item]:!mb-4">
                <Form.Item label="Task title" name="title" rules={[{ required: true, whitespace: true, message: 'Add a short task title.' }, { max: 100, message: 'Keep the title under 100 characters.' }]}>
                    <Input maxLength={100} placeholder="What needs your attention?" />
                </Form.Item>
                <Form.Item label="Description" name="description" rules={[{ required: true, whitespace: true, message: 'Add a little context for future you.' }, { max: 300, message: 'Keep the description under 300 characters.' }]}>
                    <TextArea maxLength={300} showCount rows={3} placeholder="A few details to help you get started..." />
                </Form.Item>
                <div className="grid grid-cols-2 gap-[13px] max-[560px]:grid-cols-1 max-[560px]:gap-0">
                    <Form.Item label="Priority" name="priority" rules={[{ required: true, message: 'Choose a priority.' }]}>
                        <Select placeholder="Choose priority" options={[{ value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }]} />
                    </Form.Item>
                    <Form.Item label="Plan for" name="forWhen" rules={[{ required: true, message: 'Choose a day.' }]}>
                        <Select placeholder="Choose a day" options={[{ value: 'TODAY', label: 'Today' }, { value: 'TOMORROW', label: 'Tomorrow' }]} />
                    </Form.Item>
                </div>
                <div className="mt-[5px] flex justify-end gap-[9px]"><Button className="!h-[39px] !min-w-[95px]" onClick={onCancel}>Cancel</Button><Button className="!h-[39px] !min-w-[95px]" type="primary" htmlType="submit" loading={busy}>{task ? 'Save changes' : 'Create task'}</Button></div>
            </Form>
        </Modal>
    );
}